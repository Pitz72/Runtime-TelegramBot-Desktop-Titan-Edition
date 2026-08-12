# Runtime TelegramBot Desktop Titan Edition — Guía de Inicio Rápido

Bienvenido a **Runtime TelegramBot Desktop Titan Edition**. Esta guía te permite configurar tu primer bot y empezar a publicar contenido en tu canal de Telegram en pocos minutos.

---

## 1. Obtener el Token de Telegram

Antes de iniciar la aplicación, debes crear un bot en Telegram:

1. Abre Telegram y busca **@BotFather** (tiene la marca azul de verificación).
2. Envía el comando `/newbot` y sigue las instrucciones para asignar un nombre al bot.
3. @BotFather te devolverá un **Token API** (ej. `123456789:ABCdefGHIjklMNOpqr...`). Cópialo.
4. Agrega el bot a tu canal de Telegram como **Administrador** con el permiso de enviar mensajes.

---

## 2. Primer Inicio — Configuración del Bot

En el primer inicio, haz clic en **«+ Nuevo Bot»** y completa los campos:

- **Nombre** — un nombre para identificar el bot en la interfaz (ej. *Canal de Noticias*).
- **Token** — el Token API proporcionado por @BotFather.
- **Channel ID** — el nombre del canal (ej. `@micanal`) o el ID numérico para canales privados (ej. `-100123456789`).
- **Fecha de Inicio** — el bot ignorará todos los contenidos publicados antes de esta fecha. Útil para evitar inundar el canal con artículos antiguos.

---

## 3. Agregar Feeds (Feed Manager)

En el panel del bot, haz clic en **«+ Agregar Feed»**:

1. Asigna un **Nombre** descriptivo al feed.
2. Selecciona el **Tipo**: News, Podcast o YouTube.
3. Pega la **URL**:
   - News / Podcast: URL del feed RSS.
   - YouTube: URL del canal o handle (ej. `@RuntimeRadio`). *No se requiere API Key.*
4. Usa **Probar (⚡)** para verificar la validez del enlace, luego **Guardar**.

### Opciones avanzadas de feed

- **Filtro de Palabras Clave** — Filtra artículos por palabras clave a incluir o excluir. Se puede activar en la configuración del feed. Un badge ámbar indica el filtro activo.
- **Intervalo Personalizado** — Establece un intervalo de obtención individual para el feed (de 5 minutos a 24 horas), independiente del intervalo global del bot.
- **Digest Mode** — En lugar de publicar cada artículo individualmente, acumula contenido durante un intervalo configurable (1h, 6h, 12h, 24h, 7d) y lo envía en un único mensaje resumen. Un badge morado indica el modo activo.
- **Importar OPML** — Importa varios feeds a la vez desde un archivo `.opml` estándar mediante el botón OPML en el Feed Manager.

---

## 4. Personalizar los Mensajes (Template)

Ve a la configuración del bot → pestaña **Template**:

- Usa los **Smart Chips** para insertar variables dinámicas: `{{title}}`, `{{link}}`, `{{summary}}`, `{{feedName}}`, etc.
- Hay 4 plantillas separadas disponibles: Inicio, News, Podcast, YouTube.
- El **Validador** señala errores en tiempo real (etiquetas no equilibradas, chips desconocidos, enlaces no seguros).
- El botón **Vista Previa** muestra cómo aparecerá el mensaje con datos de ejemplo, sin salir del editor.

Etiquetas HTML compatibles con Telegram: `<b>`, `<i>`, `<code>`, `<a href="...">`.

---

## 5. Inicio — Ignition

Cuando el bot está configurado y se han agregado los feeds:

- Haz clic en el botón **Play (▶)** en la consola.
- El anillo de estado comenzará a girar y el bot entrará en funcionamiento.
- En el panel **System Logs** verás en tiempo real la obtención de feeds y la publicación en Telegram.

Para monitorear varios bots simultáneamente, usa el toggle **ALL BOTS / THIS BOT** en el log.

---

## 6. Estadísticas

Haz clic en el icono **Analytics (📊)** en el panel para ver:

- Contadores de artículos publicados: hoy / últimos 7 días / total.
- Desglose por feed, ordenado por volumen de publicación.

---

## Configuración del Sistema

Accesible desde el icono de engranaje en la esquina superior derecha:

- **General** — intervalo de verificación global, horas de silencio, idioma.
- **Backup** — exportación y restauración de la base de datos.
- **Performance Mode** — deshabilita efectos que consumen GPU (scanlines, blur, glow, animaciones). Útil en equipos con hardware limitado. Efectivo inmediatamente sin reinicio.

---

## Portabilidad — Archivo .rtb

Para mover un bot a otro equipo sin perder la configuración:

1. En la configuración del bot → **Exportar (.rtb)**.
2. Transfiere el archivo al nuevo PC.
3. En el nuevo PC → **Importar (.rtb)** y vuelve a ingresar el token (los tokens son específicos de la máquina por seguridad).

---

## Solución de Problemas

- **Errores de YouTube** — Google actualiza periódicamente sus servidores. Si aparecen errores rojos en los feeds de YouTube, deshabilita temporalmente el feed y espera una actualización de la app.
- **Token no válido** — Verifica que el bot haya sido agregado al canal como administrador con el permiso de enviar mensajes.
- **Linux sin libsecret** — La app funciona normalmente usando el fallback AES-256-GCM. Para el llavero nativo instala: `sudo apt-get install libsecret-1-0`.

---

**Runtime TelegramBot Desktop · Titan Edition** es software libre, publicado bajo licencia **MIT**: puedes usarlo, estudiarlo, modificarlo y redistribuirlo.

La mayor parte del código se escribió con modelos de lenguaje (Google Gemini, Anthropic Claude). La concepción, la dirección del proyecto y la verificación son de Simone Pizzi.

Para el tratamiento completo consulta el **Manual de Usuario Avanzado** en PDF, disponible en ocho idiomas.

Contacto: simonepizzi.runtimeradio.it/contatti
Donación libre: paypal.me/runtimeradio
