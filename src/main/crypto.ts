import { safeStorage } from 'electron';
import { app } from 'electron';
import nodeCrypto from 'node:crypto';
import { join } from 'node:path';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

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
        _machineKey = Buffer.from(readFileSync(keyPath, 'utf-8').trim(), 'hex');
    } else {
        _machineKey = nodeCrypto.randomBytes(32);
        writeFileSync(keyPath, _machineKey.toString('hex'), { mode: 0o600 });
    }
    return _machineKey;
}

/**
 * Cifra un token per la memorizzazione in DB.
 * Usa safeStorage (OS keychain) se disponibile, altrimenti AES-256-GCM con chiave macchina.
 * Output sempre prefissato (ss: o mk:) per disambiguare al momento della decifratura.
 */
export function encryptToken(plaintext: string): string {
    if (safeStorage.isEncryptionAvailable()) {
        try {
            return PREFIX_SS + safeStorage.encryptString(plaintext).toString('base64');
        } catch (e) {
            console.error('[crypto] safeStorage.encryptString fallita, fallback a machine-key:', e);
        }
    }
    const key = getMachineKey();
    const iv = nodeCrypto.randomBytes(12);
    const cipher = nodeCrypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    // Formato: iv (12B) + authTag (16B) + ciphertext
    return PREFIX_MK + Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

/**
 * Decifra un token letto dal DB.
 * Gestisce tutti i formati storici:
 *  - 'ss:...'  → safeStorage (v1.10.2+)
 *  - 'mk:...'  → machine-key AES-256-GCM (v1.10.2+ fallback)
 *  - base64 senza prefisso → legacy safeStorage (v1.7.8–v1.10.1), migrato al prossimo write
 *  - testo plain → legacy pre-v1.7.8, migrato al prossimo write
 */
export function decryptToken(stored: string): string {
    if (!stored) return '';

    if (stored.startsWith(PREFIX_SS)) {
        if (!safeStorage.isEncryptionAvailable()) return '';
        try {
            return safeStorage.decryptString(Buffer.from(stored.slice(PREFIX_SS.length), 'base64'));
        } catch {
            return '';
        }
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
            return decipher.update(ciphertext).toString('utf8') + decipher.final('utf8');
        } catch {
            return '';
        }
    }

    // Legacy: base64 senza prefisso — era safeStorage pre-v1.10.2
    if (safeStorage.isEncryptionAvailable()) {
        try {
            return safeStorage.decryptString(Buffer.from(stored, 'base64'));
        } catch {
            // Non è un blob safeStorage, potrebbe essere testo plain (pre-v1.7.8)
        }
    }

    // Pre-v1.7.8: token in chiaro (solo se non sembra JSON)
    if (stored.startsWith('{')) return '';
    return stored;
}
