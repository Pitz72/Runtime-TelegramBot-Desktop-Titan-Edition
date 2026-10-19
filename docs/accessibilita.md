# Dichiarazione di accessibilità

**Runtime TelegramBot Desktop · Titan Edition**, interfaccia ridisegnata nella serie 2.4.
Ultima verifica: 19 ottobre 2026.

## Stato di conformità

L'interfaccia è **conforme alle WCAG 2.2 di livello AA** per i criteri verificati qui sotto, con i limiti dichiarati in fondo.

Si tratta di un'**autovalutazione**: nessun ente terzo ha certificato il programma. Quello che c'è è un metodo ripetibile — strumenti automatici, misure di contrasto calcolate e prove da tastiera — i cui controlli principali girano a ogni build, così la conformità non dipende dalla memoria di chi modifica il codice.

## Cosa è stato verificato e come

### Audit automatico (axe-core 4.14)

Regole WCAG 2.0, 2.1 e 2.2 di livello A e AA più le buone pratiche di axe, eseguite sull'interfaccia vera montata nel banco di prova (`npm run preview:ui`, parametro `?axe`). Stati controllati, uno per uno:

| Stato | Violazioni |
| :--- | :---: |
| Schermata iniziale | 0 |
| Configurazione guidata (passo 1 e campo vuoto con errore) | 0 |
| Dashboard, con il motore spento e acceso, diario e console | 0 |
| Nuovo bot (vuoto e con errori di validazione) | 0 |
| Nuova sorgente, prova dell'indirizzo, modifica, conferma di eliminazione | 0 |
| Impostazioni del bot: Generale, Pianificazione, Messaggi (con anteprima), Avanzate | 0 |
| Conferma di eliminazione del bot sopra le impostazioni | 0 |
| Impostazioni: Generale, Accessibilità, Dati e backup, Informazioni | 0 |
| Licenza, statistiche, guida rapida, novità, esito della verifica aggiornamenti | 0 |

In alcuni stati axe segnala il contrasto come «da verificare a mano»: succede quando il testo sta su un pannello ancora in animazione o sul gradiente della schermata iniziale, e lo strumento non riesce a calcolare lo sfondo. Quelle coppie di colori sono comunque misurate dal controllo successivo.

L'audit ha trovato, ed è stato corretto prima della pubblicazione: landmark duplicati con due finestre aperte, una finestra sottostante ancora raggiungibile dal lettore di schermo, il corpo della guida rapida che scorreva senza poter essere raggiunto da tastiera.

### Contrasto dei colori (1.4.3, 1.4.11)

Tutti i colori dell'interfaccia vengono da un unico file, `src/renderer/src/theme/palette.json`. Lo script `npm run check:contrast` misura ogni coppia testo/sfondo e componente/sfondo che l'interfaccia usa davvero — **65 coppie** — e blocca la build se una scende sotto la soglia.

| Elemento | Soglia | Valore più basso misurato |
| :--- | :---: | :---: |
| Testo normale | 4,5:1 | 4,83:1 (testo bianco sul pulsante rosso di eliminazione) |
| Testo sul pulsante principale blu | 4,5:1 | 5,17:1 |
| Testo secondario più tenue (`fg-3`) | 4,5:1 | 6,02:1 |
| Bordi dei campi e dei controlli | 3:1 | 3,75:1 |
| Anello di focus | 3:1 | 3,64:1 (sul pulsante blu); oltre 9:1 sugli sfondi |

Nessuna informazione è affidata al solo colore: lo stato dei bot e del motore è sempre scritto («Attivo», «Motore acceso»), i tipi di sorgente hanno icona ed etichetta, gli errori hanno icona e testo.

### Tastiera (2.1.1, 2.1.2, 2.4.3, 2.4.7, 2.4.11)

Provato premendo i tasti, non simulando i clic:

- ogni comando è un pulsante o un campo vero e si raggiunge con **Tab**; il primo elemento della pagina è il collegamento **«Vai al contenuto»**;
- le schede si scorrono con le **frecce**, **Home** e **Fine**; gli interruttori con **Spazio**;
- all'apertura di una finestra il focus entra nel primo campo; **Tab** gira all'interno senza uscire; **Esc** chiude solo la finestra in cima; alla chiusura il focus torna esattamente al pulsante che l'aveva aperta;
- nelle conferme di eliminazione il focus parte da **«Annulla»**, così un Invio di troppo non cancella niente;
- il focus è sempre visibile: un contorno chiaro di 2 px staccato dal controllo, che resta anche nella modalità a contrasto elevato di Windows.

### Lettori di schermo (1.3.1, 4.1.2, 4.1.3)

- finestre con `role="dialog"` o `alertdialog`, titolo e descrizione collegati, e tutto il resto reso inerte mentre sono aperte;
- campi con etichetta visibile collegata; suggerimenti ed errori associati con `aria-describedby`, errori annunciati con `role="alert"` e campo marcato `aria-invalid`;
- interruttori `role="switch"`, schede `tablist`/`tab`/`tabpanel`, barre di avanzamento con valore;
- le notifiche sono annunciate (gli errori subito, il resto con calma) e restano chiudibili anche con una finestra aperta;
- lo stato del motore è annunciato quando cambia; il diario è una regione `log` senza annunci continui;
- la lingua della pagina segue quella scelta, per la pronuncia corretta.

### Ingrandimento e movimento (1.4.4, 1.4.10, 2.3.3)

- **Impostazioni → Accessibilità → Dimensione dell'interfaccia**: dall'80% al 180%, anche con **Ctrl +**, **Ctrl −** e **Ctrl 0**. Il valore resta salvato tra un avvio e l'altro. Provato nell'app vera al 125% e, nel banco di prova, sull'equivalente di un portatile 1366×768 al 180%: nessun controllo esce dallo schermo, e quando l'altezza non basta l'area principale scorre invece di tagliare l'elenco.
- La finestra ha una misura minima (880×600) sotto la quale l'interfaccia verrebbe tagliata; a quella misura tutte le finestre di dialogo entrano per intero.
- Chi chiede al sistema meno animazioni le ha tolte anche in Titan; l'interruttore **«Riduci animazioni ed effetti»** fa lo stesso a mano.

### Dimensione dei comandi (2.5.8)

Il comando più piccolo misura 32×32 px, oltre i 24 richiesti.

## Limiti noti

- **Lettori di schermo reali.** La semantica è verificata con axe e controllando il DOM, ma l'interfaccia non è stata ancora provata da capo a fondo con NVDA (Windows) e Orca (Linux). È la prossima verifica da fare, e la più importante.
- **Contrasto elevato di Windows.** Le regole per `forced-colors` sono presenti (bordi veri, focus di sistema), ma non sono state provate con il tema a contrasto elevato attivo.
- **Finestre di sistema.** I dialoghi per aprire e salvare file e le conferme di importazione sono quelli del sistema operativo: la loro accessibilità dipende da Windows o dal desktop Linux.
- **Manuale PDF.** Il manuale completo descrive l'interfaccia precedente alla 2.4. La guida rapida integrata è aggiornata.
- **Messaggi su Telegram.** L'aspetto dei messaggi pubblicati nei canali dipende dai template scritti dall'utente e dall'app Telegram di chi legge.

## Come rifare la verifica

```bash
npm run check:contrast   # 65 coppie di colori contro WCAG 2.2 AA
npm run check:locales    # ogni testo esiste in italiano e in inglese
npm run preview:ui       # interfaccia nel browser, con dati finti
```

Con l'anteprima aperta su `http://localhost:5199/?axe`, in console `await runAxe()` restituisce le violazioni dello stato corrente. `check:contrast` e `check:locales` girano anche nella CI a ogni pull request.

## Segnalare un problema

Se qualcosa nell'interfaccia non si riesce a usare con la tastiera, con un lettore di schermo o ingrandendo il testo, è un difetto: va segnalato aprendo una issue su GitHub o scrivendo dalla pagina [contatti](https://simonepizzi.runtimeradio.it/contatti).
