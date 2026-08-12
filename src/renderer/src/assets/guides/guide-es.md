# ⚡ Runtime TelegramBot Desktop Titan Edition: Guía de Inicio Rápido

Bienvenido a **Runtime TelegramBot Desktop Titan Edition**. Esta guía rápida te permitirá configurar tu primer bot y comenzar a publicar contenido en tu canal de Telegram en menos de 3 minutos.

---

## 1. Preparación: Obtén el Token de Telegram
Antes de iniciar Titan, debes crear un «Bot» en Telegram:
1. Abre Telegram y busca al usuario **@BotFather** (tiene la marca de verificación azul).
2. Envía el comando `/newbot` y sigue las instrucciones para darle un nombre a tu bot.
3. Al final, @BotFather te devolverá un **Token API** (una cadena larga como `123456789:ABCdefGHIjklMNOpqr...`). **Cópialo y guárdalo en un lugar seguro.**
4. Añade el bot recién creado a tu Canal de Telegram como **Administrador** (debe tener el permiso para «Enviar Mensajes»).

## 2. El Primer Inicio (Asistente de Configuración)
Inicia Runtime TelegramBot Desktop Titan Edition. Si es tu primera vez, aparecerá el asistente de 4 pasos:
*   **Nombre del Bot:** Elige un nombre para reconocerlo (ej., *Canal de Noticias*).
*   **Bot Token:** Pega el Token proporcionado por @BotFather.
*   **Channel ID:** Introduce el nombre de tu canal (ej., `@micanal`). Si es un canal privado, introduce el ID numérico (ej., `-100123456789`).
*   **Fecha de Inicio:** Elige una fecha. El bot **ignorará** todos los artículos y videos publicados antes de esta fecha, evitando inundar tu canal con contenido antiguo.

## 3. Añadir Fuentes (Gestor de Feeds)
Una vez dentro del Panel de Control:
1. Asegúrate de que tu bot esté seleccionado en la columna de la izquierda.
2. En el panel de **Fuentes de Feed**, haz clic en **«+ Añadir Fuente»**.
3. Introduce el Nombre (ej., *Mi Podcast*) y selecciona el **Tipo** (Podcast, Noticias o YouTube).
4. Pega la URL:
   * Para Noticias y Podcasts: pega la URL del feed RSS.
   * Para YouTube: Puedes pegar directamente la URL del canal o el handler (ej., `@RuntimeRadio`). *¡No se necesitan Claves API!*
5. Usa el botón **Probar (⚡)** para verificar que el enlace sea válido, luego haz clic en **Guardar**.

## 4. Personalizar Mensajes (Plantillas)
¿Quieres que tus publicaciones tengan el formato perfecto?
1. Haz clic en el icono de **Ajustes (⚙️)** en la columna de la izquierda.
2. Ve a la pestaña de **Plantillas**.
3. Usa el cómodo panel de botones en la parte superior para insertar variables automáticas como `{{title}}`, `{{link}}` o `{{summary}}`.
4. Puedes usar etiquetas HTML básicas compatibles con Telegram, por ejemplo: `<b>Negrita</b>`, `<i>Cursiva</i>`, u ocultar un enlace largo detrás de un texto usando `<a href="{{link}}">Haz clic aquí</a>`.

## 5. Encendido (Ignición)
¿Has introducido el token y añadido los feeds? Ya estás listo.
*   Haz clic en el gran botón de **Play (▶)** en el centro de la consola.
*   El anillo comenzará a girar y el bot entrará en funcionamiento.
*   En el panel de **System Logs** verás en tiempo real al bot leyendo tus fuentes y publicando nuevos contenidos en Telegram.

---

### 💡 Consejos Útiles y Solución de Problemas
*   **Horarios de Silencio:** En los ajustes del bot puedes definir el horario de actividad. Si lo configuras de 08:00 a 22:00, las noticias nocturnas no se perderán, ¡sino que se pondrán en cola y se publicarán a las 08:00 de la mañana!
*   **Errores de YouTube:** Si recibes errores «rojos» en los canales de YouTube, no entres en pánico. Google actualiza a menudo sus servidores. Apaga temporalmente el feed de YouTube desde el botón dedicado en la interfaz y espera nuestra actualización de software.
*   **Cambio de PC:** ¿Necesitas mover el bot a otra computadora? ¡No copies los archivos! Usa la función **Exportar (.rtb)** en los ajustes. Esto generará un archivo seguro para importar en el nuevo PC, manteniendo tus contraseñas cifradas.

---

**Runtime TelegramBot Desktop · Titan Edition** es software libre, publicado bajo licencia **MIT**: puedes usarlo, estudiarlo, modificarlo y redistribuirlo.

La mayor parte del código se escribió con modelos de lenguaje (Google Gemini, Anthropic Claude). La concepción, la dirección del proyecto y la verificación son de Simone Pizzi.

Para el tratamiento completo usa el botón **Descargar Manual (PDF)**.

Contacto: simonepizzi.runtimeradio.it/contatti
Donación libre: paypal.me/runtimeradio
