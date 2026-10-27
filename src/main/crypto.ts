import { safeStorage } from 'electron';
import { app } from 'electron';
import nodeCrypto from 'node:crypto';
import { join } from 'node:path';
import { readFileSync, writeFileSync, existsSync, renameSync } from 'node:fs';

// Prefissi per distinguere il formato del token cifrato in DB
const PREFIX_SS = 'ss:'; // safeStorage (OS keychain)
const PREFIX_MK = 'mk:'; // machine-key (node:crypto AES-256-GCM fallback)
const ALGORITHM = 'aes-256-gcm';
const KEY_FILE = '.machine-key';

let _machineKey: Buffer | null = null;

/**
 * Restituisce (o genera) la chiave macchina persistente.
 * Usata solo quando safeStorage non è disponibile (es. Linux senza libsecret).
 * La chiave è salvata in userData con permessi 0o600.
 */
function getMachineKey(): Buffer {
    if (_machineKey) return _machineKey;
    const keyPath = join(app.getPath('userData'), KEY_FILE);
    if (existsSync(keyPath)) {
        const hex = readFileSync(keyPath, 'utf-8').trim();
        if (/^[0-9a-f]{64}$/i.test(hex)) {
            _machineKey = Buffer.from(hex, 'hex');
            return _machineKey;
        }
        // Chiave danneggiata: con una lunghezza sbagliata createCipheriv lancia, e da quel
        // momento nessun bot si poteva più creare né salvare. I token cifrati con la chiave
        // rovinata erano già illeggibili; la si mette da parte (non si cancella) e se ne crea una nuova.
        const aside = `${keyPath}.corrupt-${Date.now()}`;
        console.error(`[crypto] ${KEY_FILE} non valida: spostata in ${aside}, ne genero una nuova.`);
        try { renameSync(keyPath, aside); } catch (e) { console.error('[crypto] Impossibile spostare la chiave danneggiata:', e); }
    }
    _machineKey = nodeCrypto.randomBytes(32);
    writeFileSync(keyPath, _machineKey.toString('hex'), { mode: 0o600 });
    return _machineKey;
}

/**
 * True se il portachiavi del sistema è utilizzabile.
 *
 * Solo API asincrone di `safeStorage`: quelle sincrone (`isEncryptionAvailable`,
 * `encryptString`, `decryptString`) sono deprecate da Electron 45 e spariscono nella 46,
 * insieme al backend sincrono di Chromium su cui poggiano. I dati cifrati con le vecchie
 * si leggono con le nuove: stessi portachiavi, stesso formato.
 */
async function keychainAvailable(): Promise<boolean> {
    try {
        return await safeStorage.isAsyncEncryptionAvailable();
    } catch {
        return false;
    }
}

/**
 * Cifra un testo con il portachiavi del sistema: il blob in base64, oppure `null` se il
 * portachiavi non c'è o la cifratura fallisce.
 */
export async function keychainEncrypt(plaintext: string): Promise<string | null> {
    if (!(await keychainAvailable())) return null;
    try {
        return (await safeStorage.encryptStringAsync(plaintext)).toString('base64');
    } catch (e) {
        console.error('[crypto] safeStorage.encryptStringAsync fallita:', e);
        return null;
    }
}

/**
 * Decifra un blob del portachiavi. `null` se non si può (portachiavi assente, profilo o
 * computer diverso). `reEncrypt` = il portachiavi chiede di cifrarlo di nuovo (chiave ruotata).
 */
export async function keychainDecrypt(base64: string): Promise<{ plain: string; reEncrypt: boolean } | null> {
    if (!(await keychainAvailable())) return null;
    try {
        const { result, shouldReEncrypt } = await safeStorage.decryptStringAsync(Buffer.from(base64, 'base64'));
        return { plain: result, reEncrypt: shouldReEncrypt };
    } catch {
        return null;
    }
}

function machineKeyEncrypt(plaintext: string): string {
    const key = getMachineKey();
    const iv = nodeCrypto.randomBytes(12);
    const cipher = nodeCrypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    // Formato: iv (12B) + authTag (16B) + ciphertext
    return PREFIX_MK + Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

/**
 * Cifra un token per la memorizzazione in DB.
 * Usa safeStorage (OS keychain) se disponibile, altrimenti AES-256-GCM con chiave macchina.
 * Output sempre prefissato (ss: o mk:) per disambiguare al momento della decifratura.
 */
export async function encryptToken(plaintext: string): Promise<string> {
    const blob = await keychainEncrypt(plaintext);
    return blob !== null ? PREFIX_SS + blob : machineKeyEncrypt(plaintext);
}

/** Esito della decifratura: `upgrade` = va riscritto nel formato corrente (legacy o chiave ruotata). */
export interface DecryptedToken {
    token: string;
    upgrade: boolean;
}

/**
 * Decifra un token letto dal DB.
 * Gestisce tutti i formati storici:
 *  - 'ss:...'  → safeStorage (v1.10.2+)
 *  - 'mk:...'  → machine-key AES-256-GCM (v1.10.2+ fallback)
 *  - base64 senza prefisso → legacy safeStorage (v1.7.8–v1.10.1)
 *  - testo plain → legacy pre-v1.7.8
 * Un token illeggibile torna vuoto: il motore salta il bot e l'interfaccia chiede il token.
 */
export async function decryptToken(stored: string): Promise<DecryptedToken> {
    if (!stored) return { token: '', upgrade: false };

    if (stored.startsWith(PREFIX_SS)) {
        const decrypted = await keychainDecrypt(stored.slice(PREFIX_SS.length));
        if (!decrypted) {
            console.warn('[crypto] Token cifrato con safeStorage non leggibile (portachiavi assente, o profilo utente/computer diverso da quello di cifratura).');
            return { token: '', upgrade: false };
        }
        return { token: decrypted.plain, upgrade: decrypted.reEncrypt };
    }

    if (stored.startsWith(PREFIX_MK)) {
        try {
            const key = getMachineKey();
            const buf = Buffer.from(stored.slice(PREFIX_MK.length), 'base64');
            const iv = buf.subarray(0, 12);
            const authTag = buf.subarray(12, 28);
            const ciphertext = buf.subarray(28);
            const decipher = nodeCrypto.createDecipheriv(ALGORITHM, key, iv);
            decipher.setAuthTag(authTag);
            return { token: decipher.update(ciphertext).toString('utf8') + decipher.final('utf8'), upgrade: false };
        } catch (e) {
            console.warn('[crypto] Decifratura machine-key fallita — token illeggibile (file .machine-key assente o diverso):', e);
            return { token: '', upgrade: false };
        }
    }

    // Legacy: base64 senza prefisso — era safeStorage pre-v1.10.2
    const legacy = await keychainDecrypt(stored);
    if (legacy) return { token: legacy.plain, upgrade: true };

    // Pre-v1.7.8: token in chiaro (solo se non sembra JSON)
    if (stored.startsWith('{')) return { token: '', upgrade: false };
    return { token: stored, upgrade: true };
}
