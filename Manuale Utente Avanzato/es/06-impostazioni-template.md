## Capítulo 6: Ajustes avanzados y plantillas

Los ajustes de cada bot se abren desde el icono de deslizadores (🎚️) junto a su nombre, en la columna de la izquierda. La ventana tiene dos pestañas: **General** (los parámetros del bot) y **Plantillas** (el aspecto de los mensajes).

### 6.1 Intervalo de revisión y notificaciones
En la pestaña **General**, además de los datos que ya conoces (Nombre, Token, ID del Canal, Fecha de Inicio), hay dos ajustes que deciden el comportamiento del bot:

-   **Intervalo de Revisión.** Un deslizador de 1 a 120 minutos (15 por defecto) que establece cada cuánto va el bot a revisar los feeds. Es el ritmo de base; si una fuente concreta necesita otro paso, se lo das desde el Feed Manager (Capítulo 5).
-   **Notificaciones.** Un interruptor: cuando está encendido, Titan hace aparecer un aviso del sistema (una notificación de escritorio) en cada publicación con éxito. Si gestionas canales muy activos y no quieres que se te avise en cada post, apágalo.

Junto al campo Token, un icono con forma de ojo te permite mostrarlo u ocultarlo mientras lo pegas.

![La pestaña General de los ajustes del bot: intervalo de revisión, notificaciones y horario activo.](screenshots/04-bot-settings-general.png)

### 6.2 Franjas horarias de silencio (Horario Activo)
Los periódicos extranjeros y los creadores internacionales publican a menudo en plena noche, y una notificación push a las tres de la madrugada no le gusta a nadie. Las franjas horarias de silencio sirven precisamente para esto.

Siempre en la pestaña **General**, la sección **Horario Activo** tiene dos campos: **Desde** (p. ej. 08:00) y **Hasta** (p. ej. 22:00). Por defecto la ventana va de 00:00 a 23:59, es decir, ningún silencio: eres tú quien la estrecha.

-   *Fuera de la ventana.* El motor no se detiene: sigue revisando los feeds RSS y YouTube toda la noche, para no perderse nada. Solo que, en lugar de enviar de inmediato, aparta los contenidos en una cola de espera **persistente**, guardada en disco. Aunque apagues el ordenador, la cola sigue ahí al reiniciar.
-   *Al reabrir.* En cuanto el reloj vuelve a entrar en la franja permitida, el bot despacha en orden cronológico todo lo que ha acumulado, publicando un post cada 3 segundos hasta agotar la cola.

Así tus automatizaciones respetan el descanso del público y el contenido llega por la mañana, cuando tiene más probabilidades de leerse.

### 6.3 Editor de plantillas y Smart Chips
Por defecto Titan publica con una maquetación limpia pero estándar. Si quieres dar a los mensajes tu línea editorial (un emoji como logo, los enlaces dispuestos a tu manera), abre la pestaña **Plantillas**.

Encuentras cuatro áreas de texto separadas, una por formato: **Inicio**, **News**, **Podcast**, **YouTube**. Se escriben en el **HTML compatible con Telegram**: las etiquetas útiles son `<b>` (negrita), `<i>` (cursiva), `<code>` (monoespacio) y `<a href="...">` (enlace).

![La pestaña Plantillas con el editor, los Smart Chips para las variables y la vista previa del mensaje.](screenshots/05-bot-settings-templates.png)

Encima de cada área, los botones **Smart Chips** insertan las variables dinámicas, que el bot sustituirá por el dato real en el momento del envío:

-   `{{title}}`: el título del artículo o del vídeo.
-   `{{feedName}}`: el nombre que le has dado a la fuente en el Feed Manager (por ejemplo *Resumen de Prensa*).
-   `{{link}}`: la dirección del artículo.
-   `{{summary}}`: una breve vista previa del texto (300 caracteres como máximo).

*Texto limpio.* No te preocupes por lo que llega de los feeds: Titan limpia el texto de las etiquetas HTML de la fuente (imágenes, tablas, párrafos) y neutraliza los caracteres especiales antes del envío, de modo que un artículo «sucio» no puede hacer fallar el mensaje.

Dos herramientas te ayudan a no equivocarte:

-   **Vista previa.** El botón con forma de ojo muestra cómo quedará el mensaje, con datos de ejemplo en lugar de las variables, sin salir del editor.
-   **Validador.** Mientras escribes, Titan señala los problemas en tiempo real: etiquetas no equilibradas, variables inexistentes, enlaces no seguros. El borde del área se vuelve rojo para los errores, amarillo para los avisos.

*Enlaces limpios.* Telegram sabe ocultar los enlaces largos dentro del texto. En lugar de «Haz clic aquí: {{link}}», escribe `<a href="{{link}}">Leer el artículo</a>`: el usuario verá solo la frase azul en la que se puede hacer clic.

### 6.4 La Zona de Peligro: reiniciar el historial
Al final de la pestaña **General** hay una sección roja, la *Zona de Peligro*. El botón **Borrar Historial** es potente y destructivo: borra la memoria del bot, es decir, todo lo que ya ha publicado.

-   *Cuándo sirve.* Si has borrado por error muchos mensajes del canal y quieres que el bot vuelva a publicar las últimas noticias para reconstruir el tablón.
-   *Cómo usarlo sin desastres.* Si borras el historial y pulsas Play, el bot considera «nuevo» todo lo que encuentra en los feeds y lo envía en bloque, inundando el canal. Para evitarlo, tras borrar, devuelve la **Fecha de Inicio** (en la misma pestaña) a la fecha de hoy: así el bot olvida el pasado pero publica solo de hoy en adelante.

Al borrar el historial, los contadores de las estadísticas también vuelven a cero (Capítulo 3). Junto a la Zona de Peligro también está la exportación del bot en formato `.rtb`, que vemos en el Capítulo 7.

---
