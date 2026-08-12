# Politica di sicurezza

## Segnalare una vulnerabilità

**Non aprire una issue pubblica.** Scrivere a **info@runtimeradio.it** con oggetto `[SECURITY] Titan Edition`, includendo:

- una descrizione del problema e del suo impatto;
- i passi per riprodurlo;
- la versione dell'applicazione e il sistema operativo.

Il progetto è mantenuto da una persona sola: aspettati una prima risposta entro pochi giorni, non entro poche ore. Una volta confermata, la correzione viene pubblicata in una release e la segnalazione accreditata nel changelog, salvo richiesta contraria.

## Versioni supportate

Riceve correzioni solo l'ultima versione pubblicata. L'applicazione si aggiorna da sola e chiede conferma prima di scaricare e installare.

## Modello di sicurezza

Cosa protegge l'applicazione e cosa no.

### I token dei bot

I token Telegram sono cifrati nel database SQLite con due livelli:

1. **`safeStorage` di Electron** (primario) — usa il portachiavi del sistema operativo: DPAPI su Windows, libsecret su Linux. I valori sono prefissati `ss:`.
2. **AES-256-GCM** (fallback) — usato su Linux senza libsecret. La chiave è un buffer casuale di 32 byte generato al primo avvio e salvato in `userData/.machine-key` con permessi `0600`. I valori sono prefissati `mk:`.

**Conseguenza pratica:** i token sono legati alla macchina. Copiare `titan.db` su un altro computer non li porta con sé — vanno reinseriti a mano. È voluto.

Lo stesso vale per i file `.rtb` esportati: il token dentro è cifrato con `safeStorage` e leggibile solo sulla macchina che lo ha esportato. Su una macchina senza `safeStorage` il token viene esportato **vuoto**, non in chiaro.

I token vengono redatti dai file di log e dalla console dell'applicazione, così che un log allegato a una segnalazione non li esponga.

### Superficie del renderer

- `contextIsolation` attivo e `sandbox: true`.
- Nessun accesso diretto a Node dal renderer: tutto passa da `preload/index.ts` via `contextBridge`, che espone un elenco chiuso di funzioni.
- Content-Security-Policy con `script-src 'self'`: niente script inline, niente script remoti.
- Tutti gli handler IPC validano i propri input (tipi, intervalli, formati orari, tipi di feed).
- Le finestre esterne sono negate: gli URL vengono aperti nel browser di sistema e solo se `http`/`https`.

### Feed non attendibili

Un feed RSS è contenuto controllato da terzi, e viene trattato come tale:

- **anti-SSRF** — schemi non-HTTP rifiutati, indirizzi privati/loopback/link-local bloccati sia in forma testuale (IPv4, IPv6, forme decimali e esadecimali) sia risolvendo il nome via DNS prima del fetch;
- **HTML** — i sommari sono ripuliti da script, stili e tag; le entità sono decodificate e ri-escapate prima dell'invio;
- **URL nei messaggi** — i link vengono percent-encodati nei caratteri che potrebbero chiudere l'attributo `href`, così un feed non può iniettare HTML nel messaggio pubblicato sul canale.

**Limite noto:** `rss-parser` segue i redirect HTTP e la destinazione di un `3xx` non ripassa dalla validazione anti-SSRF. Bloccare i redirect romperebbe i molti feed legittimi che fanno `http`→`https` o passano da servizi di aggregazione. Serve comunque che sia l'utente ad aggiungere volontariamente l'URL.

### Cosa non è protetto

- **Chi ha già accesso al tuo account utente.** L'applicazione difende i token da chi legge il disco (backup, altro profilo, altra macchina), non da un processo che gira come te: `safeStorage` e DPAPI decifrano su richiesta di qualsiasi processo del tuo profilo. È il limite di tutte le applicazioni desktop, e vale la pena saperlo.
- **File `.rtb` di provenienza sconosciuta.** Vengono validati strutturalmente (campi obbligatori, tipi, URL anti-SSRF) prima di toccare il database, ma i template dei messaggi che contengono sono HTML e vengono mostrati nell'anteprima dell'editor. La CSP impedisce l'esecuzione di script; resta il fatto che importare un `.rtb` da uno sconosciuto è come aprire un file di configurazione di uno sconosciuto.
- **Il database non è cifrato.** Lo sono solo i token. Titoli, link, storico e impostazioni sono in chiaro dentro `titan.db`.
- **Gli installer non sono firmati.** Non esiste un certificato di code signing: Windows SmartScreen mostrerà un avviso alla prima esecuzione. Scaricare gli installer solo dalla pagina delle release ufficiali.

### Rete

L'applicazione contatta soltanto: i server dei feed configurati, `api.telegram.org`, gli endpoint interni di YouTube (InnerTube) per i feed YouTube, e GitHub per il controllo degli aggiornamenti. **Nessuna telemetria, nessun analytics, nessun server dell'autore.**
