## Capítulo 1: Introducción y conceptos básicos

### 1.1 ¿Qué es Titan Edition?
Bienvenido a **Runtime TelegramBot Titan Edition**. No es un simple «script» que copia y pega enlaces: es una herramienta de automatización editorial que lee tus fuentes (feeds RSS, podcasts, canales de YouTube) y publica los contenidos nuevos en tu canal de Telegram sin que tengas que seguirlas a mano.

Está pensado para quien gestiona comunidades, medios, emisoras de radio o canales de YouTube y necesita distribuir contenidos de forma puntual y continua.

La diferencia frente a los servicios Cloud comerciales está en dónde se ejecuta. Estos viven en servidores ajenos, a menudo con una suscripción mensual y un tope de mensajes que puedes enviar. Titan se ejecuta **en local**, en tu ordenador o en tu servidor: tus datos y tus credenciales permanecen en tu máquina, no pagas ninguna cuota y ningún plan comercial te limita el número de envíos. Solo quedan los límites anti-spam habituales de Telegram, que Titan gestiona por sí mismo.

![La pantalla de bienvenida que recibe al usuario al iniciar Titan Edition.](screenshots/01-intro-welcome.png)

### 1.2 El ecosistema «bajo el capó»
Para aprovecharlo al máximo basta con captar dos conceptos sobre cómo Titan gestiona la información.

-   **Motor asíncrono (Producer-Consumer).** Titan mantiene separadas dos tareas: una descarga sin parar los artículos de tus fuentes, la otra les da formato y los envía a Telegram. Así la descarga nunca se detiene a esperar el envío, y el envío respeta las pausas que Telegram impone para no hacer que te bloqueen como spam, el llamado *FloodWait*.
-   **La base de datos y la «memoria» del bot.** Cada vez que publica un artículo o un vídeo, Titan calcula una huella digital (un hash MD5) y la registra en su base de datos interna. Es esta memoria la que le impide volver a publicar dos veces la misma noticia, aunque apagues el ordenador durante dos días y lo vuelvas a encender.

---
