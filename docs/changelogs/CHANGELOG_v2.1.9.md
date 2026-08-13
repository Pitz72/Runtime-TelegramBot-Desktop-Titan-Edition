# v2.1.9 — Le prime due schermate, sistemate

**Data di rilascio:** 2026-08-13

## Overview

Release di sola interfaccia. Nessun cambiamento al motore, ai feed, al database o alla pubblicazione su Telegram: chi aggiorna non deve rifare nulla e non perde nulla.

Tocca le due schermate che si vedono per prime — quella di avvio e le Impostazioni di Sistema — e nasce da segnalazioni fatte usando la 2.1.8 appena installata.

## Schermata iniziale

- **«Titan Edition» sta su una riga sua, per intero.** Il titolo era un unico blocco di testo che andava a capo dove capitava: a seconda della larghezza della finestra si spezzava dopo «Titan», lasciando «Edition» orfano. Ora il capoverso è strutturale, non dipende più dalla misura della finestra, e il titolo è centrato anche quando occupa due righe.
- **Il credito agli LLM e alla direzione del progetto ora si legge.** Era scritto a 9px, in maiuscoletto monospace, in blu al 35% di opacità su fondo quasi nero: un contrasto di 2,0:1, sotto qualunque soglia di leggibilità. È diventato testo normale in un colore chiaro, a **7,13:1**. È la riga che dichiara chi ha fatto cosa in questo progetto, e in un programma a sorgente aperto nasconderla era il contrario di quel che serve.
- **Le bandiere delle lingue sono centrate.** Il loro contenitore era diviso in quattro colonne fisse, misura ereditata da quando le lingue erano otto. Con due lingue restavano appiccicate a sinistra, con un vuoto a destra che sembrava un pezzo mancante.
- **Rimossa la scritta `INIT_SEQ · TITAN_DESKTOP_RUNTIME`** in fondo alla schermata. Era decorazione, non uno stato del programma né una diagnostica.

## Impostazioni di Sistema

- **Il modale non esce più dallo schermo.** La scheda «Generale» impilava cinque sezioni in una colonna stretta dentro un modale largo: metà della larghezza sprecata, e un'altezza che superava quella della finestra dell'applicazione. Ora la scheda è su due colonne — lingua, aggiornamenti e documentazione a sinistra; crediti e sostegno al progetto a destra — e il modale è più largo.
- **Le tre schede hanno la stessa misura.** Il contenuto ha un'altezza fissa, quindi passare da «Generale» a «Dati e Backup» a «Performance» non fa più saltare il modale a misure diverse. Sulle finestre basse il riquadro si adatta e scorre al proprio interno, invece di sbordare.

## Note

Le due schermate sono state verificate misurandole a video, in italiano e in inglese, sia a finestra grande sia alla misura predefinita dell'applicazione (900×670).
