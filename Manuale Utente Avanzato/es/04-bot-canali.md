## Capítulo 4: Gestión de bots y canales

### 4.1 Crear varios bots
Titan es multicanal: puedes gestionar varios bots desde la misma ventana, cada uno con su canal. Pongamos que gestionas una radio: necesitas un canal de Telegram para las noticias escritas (News), uno para los episodios de audio (Podcast) y quizá un tercero para el detrás de cámaras (YouTube). No hace falta instalar el programa tres veces.

En la parte superior de la columna de los bots, a la derecha, hay un pequeño grupo de comandos. El **+** abre un formulario rápido: introduce Nombre, Token, ID del Canal y Fecha de Corte, guardas, y el nuevo perfil aparece en la lista. Junto al **+** también está el botón para **importar** un bot desde un archivo `.rtb` (Capítulo 7) y el de deslizadores (🎚️) para abrir sus **ajustes** (Capítulo 6).

Cada perfil vive por su cuenta: feeds, horarios y plantillas están separados. Cuando pulsas Play, Titan orquesta todos los bots activos en un único ciclo de trabajo, atendiéndolos por turnos.

![El Bot Selector: cada perfil muestra su nombre, su canal y su estado en línea/desconectado.](screenshots/12-bot-selector.png)

### 4.2 Obtener el Token de @BotFather
El **Bot Token** (token del bot) es la «llave de casa» que permite al software hablar con los servidores de Telegram. Para conseguir uno necesitas Telegram, desde el móvil o el ordenador:

1. En la búsqueda de Telegram escribe `BotFather` y abre el perfil oficial, reconocible por su marca azul de verificación.
2. Pulsa **Iniciar** y envía el comando `/newbot`.
3. BotFather te pide primero un «Nombre» (el que leerán los usuarios), luego un «Username» único, que debe terminar con la palabra *bot* (por ejemplo `miradio_news_bot`).
4. Si el username está libre, BotFather responde con un mensaje de enhorabuena que contiene una larga cadena alfanumérica, bajo la indicación *Use this token to access the HTTP API*.
5. Copia esa cadena: es el token que hay que pegar en Titan.

**Importante.** No compartas nunca el Token. Titan lo guarda cifrado, vinculándolo a este ordenador mediante el llavero del sistema operativo: así, aunque copies los archivos del programa en otra máquina, el token queda ilegible. Para moverlo de verdad a otro PC está el formato `.rtb`, explicado en el Capítulo 7.

### 4.3 Encontrar el Channel ID correcto
Para publicar, el bot debe saber *dónde* enviar los mensajes: es el **Channel ID** (ID del canal).

-   **Canales públicos.** Es el caso más sencillo. Si el canal tiene un enlace del tipo `t.me/micanal`, el Channel ID es `@micanal`. Ni siquiera hace falta ser preciso: Titan limpia solo lo que pegas: quita el prefijo `https://` y `t.me/`, y añade la arroba si falta. Así `https://t.me/micanal`, `t.me/micanal` y `micanal` acaban todos como `@micanal`.
-   **Canales privados.** No tienen nombre público: se identifican por una cadena numérica asignada por Telegram, que suele empezar por el signo menos (por ejemplo `-1002345678912`). Para obtenerla, reenvía un mensaje del canal a un bot de servicio gratuito como `@getidsbot`, que te responde con el código numérico exacto del chat. Ese número se pega tal cual.

*Regla de oro.* Una vez creado el canal y obtenido el ID, y **antes de arrancar el bot**, entra en los ajustes del canal de Telegram, abre **Administradores**, busca tu bot y añádelo con el permiso de enviar mensajes. Si el bot no es administrador (o el ID es erróneo), no tiene forma de escribir en el canal: en los registros aparecerá un error rojo de Telegram (los vemos en el Capítulo 9) y no se publicará nada.

---
