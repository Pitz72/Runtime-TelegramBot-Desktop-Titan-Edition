## Capítulo 7: Portabilidad y seguridad (el ecosistema OmniSync)

Titan mantiene a salvo tu trabajo y te da tres formas de guardarlo o moverlo: la copia de seguridad completa de la base de datos, el formato `.rtb` para un solo bot y la exportación de toda la configuración. Veámoslas.

### 7.1 Copia de seguridad completa de la base de datos
Haz clic en el icono de engranaje (⚙️) arriba a la derecha para abrir los **Ajustes del Sistema**, luego ve a la pestaña **Datos y Backup**.

El botón **Exportar BD** crea un clon completo de la base de datos `titan.db`: dentro está todo, los perfiles de bots, los feeds y toda la memoria histórica de las publicaciones. Con **Importar BD** seleccionas un archivo guardado antes y Titan se reinicia solo, restaurando la situación exacta de aquel momento.

![La pestaña Datos y Backup: exportación e importación de la base de datos y de la configuración.](screenshots/09-system-backup.png)

Es el método adecuado para una copia de seguridad completa, o para volver a dejarlo todo en pie tras una reinstalación en el mismo ordenador.

*Dónde vive la base de datos.* El archivo `titan.db` se guarda en una carpeta del sistema, separada del programa, de modo que una reinstalación no lo toca. Lo encuentras en Windows en `%APPDATA%\runtime-telegram-bot-titan-edition\`, en Linux en `~/.config/runtime-telegram-bot-titan-edition/`. Si algún día el software no arrancara, puedes copiar `titan.db` desde ahí a mano para ponerlo a salvo.

### 7.2 El formato .rtb: mover un bot con seguridad
Para pasar un solo bot de una instalación a otra (por ejemplo a un compañero de redacción) está **OmniSync**, el formato `.rtb` (Runtime Telegram Bot).

En los ajustes del bot, en la sección **Compartir**, el botón **Exportar** genera un archivo `.rtb`: un «cartucho digital» que contiene el nombre del bot, todos sus feeds (con filtros, intervalos y digests) y las plantillas, pero no el historial de los mensajes ya enviados. Quien lo recibe lo carga con el botón **Importar** en la columna de los bots, el icono de flecha junto al **+**.

¿Y el token? Aquí Titan toma una decisión de seguridad concreta: el token viaja en el archivo, pero cifrado y vinculado al ordenador que creó la exportación. Por eso:

-   **En el mismo ordenador** (por ejemplo tras una reinstalación), el token se vuelve a leer y a restaurar sin que hagas nada.
-   **En otro ordenador**, el token, por seguridad, no se puede descifrar: llega vacío y hay que volver a introducirlo a mano, el mismo que copias de BotFather. Todo lo demás (feeds, plantillas, ajustes) ya está en su sitio.

En la práctica, el `.rtb` mueve la configuración de forma cómoda, pero el verdadero secreto no se puede robar copiando un archivo: queda protegido por la máquina que lo generó.

*Nota para Linux.* El cifrado del token se apoya en el llavero del sistema (GNOME Keyring, KWallet u otro servicio Secret Service). Si tu distribución no tiene ninguno, Titan no se bloquea: usa un cifrado interno, también vinculado a la máquina. Para activar el llavero nativo, instala `libsecret`.

### 7.3 Exportar todos los bots juntos (configuración)
Si quieres mover no un bot sino todo el conjunto, vuelve a la pestaña **Datos y Backup**: junto a la base de datos está la exportación de la **configuración** en formato JSON. Funciona como el `.rtb`, pero sobre todos los bots de una vez: se lleva los perfiles, los feeds y las plantillas de cada uno, siempre sin el historial. Vale la misma regla del token vista arriba: se restaura solo en el mismo ordenador, en otro sitio hay que volver a introducirlo.

---
