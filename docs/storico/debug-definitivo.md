# 🛡️ Cronaca di una Caccia al Bug: L'Odissea "IronShield" (v1.10.5)

**Data:** 20 Aprile 2026  
**Autore:** Gemini CLI  
**Oggetto:** Relazione finale sulla risoluzione dello spamming multi-bot.

---

## L'Ombra del Loop Infinito
Per settimane, un'ombra ha perseguitato il codice di *Runtime TelegramBot Titan Edition*. Un bug intermittente, subdolo, capace di trasformare un sofisticato orchestratore di broadcast in una mitragliatrice impazzita di post duplicati. 

Il sintomo era sempre lo stesso: improvvisamente, senza un apparente motivo logico, il bot "esplodeva", inviando decine di video di YouTube o articoli di siti web (come *simonepizzi.runtimeradio.it*) che erano già stati pubblicati mesi, se non anni prima. 

## I Primi Tentativi: Illusioni di Sicurezza
Avevamo già provato a ergere delle mura. 
- Con la **v1.7.x**, avevamo introdotto la cifratura dei token e pulito i link.
- Con la **v1.8.6 (#27)**, avevamo introdotto il controllo sul "Titolo Hash", convinti di aver risolto il problema degli URL che cambiavano lato sito web.

Ma il bug era più intelligente. Aspettava nell'ombra del **Multi-Bot**. Sapeva che ogni bot viveva nel suo "silo" di memoria isolato e che, se un feed veniva condiviso o un database migrato, le difese potevano mostrare delle crepe.

## La Svolta: Il Tradimento di YouTube
La vera sfida è iniziata quando YouTube ha spento i suoi vecchi feed XML. Siamo stati costretti a passare a **InnerTube** (lo scraping dinamico). In quel momento, il terreno sotto i piedi del bot è diventato instabile. 
YouTube ha smesso di fornire date certe, restituendo stringhe come *"2 years ago"*. Il bot cercava di "indovinare" la data, ma quando falliva, usava un paracadute di sicurezza: l'anno **2000**.

E qui è scattata la trappola. Il motore, per un eccesso di ottimismo, diceva: *"Se non capisco bene la data o se il database è incerto dopo una migrazione, io pubblico comunque per non farti perdere la notizia"*. Quel pizzico di "gentilezza" del codice è stato il varco attraverso cui sono passati centinaia di post di spam.

## L'Attacco Finale: Anatomia della v1.10.5 "IronShield"
Il 20 Aprile 2026 abbiamo deciso di cambiare paradigma. Abbiamo smesso di essere "ottimisti" e siamo diventati **"iper-pessimisti"**. Abbiamo implementato la strategia **IronShield**:

1.  **La Valvola di Sicurezza (Year 2000 Lock):** Abbiamo istruito l'engine: se un video ha la data fallback del 2000 o se il confronto con la data di inizio del bot dà un qualsiasi errore, **fermati**. Scarta tutto. Meglio il silenzio che lo spam.
2.  **La Memoria Collettiva (Global Deduplication):** Abbiamo abbattuto i muri tra i bot. Ora, se un bot ha inviato un titolo, quel titolo è "bruciato" per sempre per quel bot, non importa da quale feed provenga o quante volte l'URL cambi. 
3.  **Il Cutoff di Ferro:** Abbiamo blindato matematicamente il confronto temporale nel database, rendendolo immune ai capricci dei fusi orari o dei dati corrotti.

## L'Ora della Verità (Log 17:14)
Il test finale ha parlato chiaro. Nei log della **v1.10.5**, abbiamo visto la magia accadere:
- `379 skipped due to cutoff date`
- `9 already processed`

Mentre il bot scansionava freneticamente migliaia di vecchi articoli, le nuove "valvole" scattavano una dopo l'altra. Il bot vedeva il contenuto "sporco", lo confrontava con la sua nuova memoria corazzata e, con una freddezza chirurgica, lo scartava.

## Conclusione: L'Obiettivo Raggiunto
Dopo settimane di analisi, righe di codice riscritte e test notturni, la caccia è finita. Abbiamo capito che il problema non era YouTube che "mentiva", ma noi che ci fidavamo troppo. 

Con la v1.10.5, abbiamo dato a Titan Desktop un vero **scudo di ferro**. Il software è ora pronto per la distribuzione ufficiale. Il mostro dello spamming è stato finalmente ricacciato nel database dei ricordi.

---
*(C) 2026 Runtime Radio — "Rendi il tuo bot una roccia, non una mitragliatrice."*
