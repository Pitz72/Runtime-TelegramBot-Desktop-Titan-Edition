## Capítulo 5: El Feed Manager (las fuentes)

### 5.1 Añadir y probar una fuente
El Feed Manager (el panel bajo la lista de bots) es la «dieta» de tu bot: aquí introduces las direcciones web (URL) de las que Titan irá a pescar los contenidos.

Para añadir una fuente:

1. Selecciona el bot al que quieres asignarla.
2. Haz clic en **Añadir Fuente**.
3. Dale un **Nombre** a la fuente. No es una etiqueta cualquiera: es el texto que podrás mostrar en la cabecera de los mensajes como firma de la noticia (es el campo `{{feedName}}` de las plantillas, Capítulo 6).
4. Elige el **Tipo**:
    -   **Podcast:** para los flujos de audio (MP3). Titan intenta recuperar la imagen de portada, a menudo escondida en las etiquetas *iTunes* que usan servicios como Spreaker o AzuraCast.
    -   **Noticias:** para los clásicos artículos de blogs, sitios de información o periódicos.
5. Pega la URL del feed (normalmente una dirección que termina en `.xml` o `.rss`).

Antes de guardar puedes usar el botón **Probar (⚡)**: hace una llamada real al enlace y te dice enseguida si responde. Si el feed es válido, un aviso verde indica cuántas noticias ha encontrado; si algo no va (sitio caído, enlace erróneo), el aviso es rojo. La prueba es solo una comprobación: no te obliga a nada, puedes guardar igualmente, pero es la forma más rápida de no introducir una dirección equivocada.

![El formulario de alta de una nueva fuente, con el nombre, el tipo, la URL y el botón de prueba.](screenshots/06-feed-form.png)

Cada fuente de la lista tiene un interruptor para activarla o ponerla en pausa sin borrarla, y los iconos para modificarla o eliminarla.

![La lista de fuentes: el tipo, la insignia de los filtros activos y el interruptor de cada feed.](screenshots/13-feed-list.png)

Si una fuente deja de responder (por ejemplo un error 404), te das cuenta: en los Registros del Sistema aparece una línea roja con el nombre del feed. Y si te preguntas cuántas fuentes puedes añadir, no hay un tope fijo: ten en cuenta, eso sí, que el motor las revisa por turnos, de modo que con muchas decenas de feeds (o muchos bots) la vuelta completa de revisión se alarga.

### 5.2 La gestión nativa de YouTube
Normalmente, integrar YouTube en un sistema de automatización es un engorro: exige una cuenta de desarrollador en Google Cloud y una clave API, con sus costes y límites. Titan se ahorra todo esto gracias a *InnerTube*, un motor que lee las páginas de YouTube como lo haría un navegador, sin ninguna clave.

1.  En **Añadir Fuente** elige el tipo **YouTube (Video)**.
2.  En el campo URL no hacen falta códigos raros ni feeds XML: pega el handle del canal (la arroba bajo el nombre del youtuber, por ejemplo `@RuntimeRadio`) o la dirección completa del canal copiada del navegador.

Del resto se encarga Titan. Hay, eso sí, una precaución útil: el **filtro anti-premiere**. Cuando un youtuber programa un directo o un vídeo «disponible dentro de dos días», YouTube lo muestra igualmente en lo alto de la lista. Un bot ingenuo enviaría la notificación de inmediato, y quien hace clic acaba en un vídeo aún no disponible. Titan, en cambio, comprueba el estado del vídeo: si está marcado como *upcoming* o *premiere*, lo descarta y solo lo publica cuando se vuelve realmente visible.

### 5.3 Opciones avanzadas del feed
Cuando añades o modificas una fuente, bajo los campos principales hay tres ajustes opcionales. Puedes ignorarlos (el feed funciona perfectamente con los valores predeterminados) o usarlos para un control más fino.

-   **Filtro por palabras clave.** Dos campos, «incluir» y «excluir», con las palabras separadas por comas. Si rellenas «incluir», Titan solo publica los contenidos en los que aparece al menos una de esas palabras, en el título o en el texto; si rellenas «excluir», descarta los que contienen aunque sea una. Una insignia ámbar en la fuente señala que el filtro está activo.
-   **Intervalo personalizado.** Por norma, cada feed sigue el ritmo de revisión del bot. Aquí puedes darle uno propio, de 5 minutos a 24 horas: cómodo para revisar más a menudo un sitio muy activo, o más de tarde en tarde uno lento. Una insignia indica el intervalo fijado.
-   **Digest.** En lugar de publicar cada contenido en cuanto sale, Titan puede acumularlos y enviarlos juntos en un único mensaje de resumen, a intervalos fijos (1 hora, 6, 12, 24 horas o 7 días). El resumen enumera los títulos con el enlace «Leer», hasta 20 contenidos por mensaje. Útil para las fuentes prolijas, que de otro modo inundarían el canal. Una insignia violeta señala el digest activo.

### 5.4 Importar varios feeds a la vez (OPML)
Si ya tienes una lista de feeds en un lector de RSS, no hace falta volver a introducirlos a mano. El botón **OPML**, arriba en el Feed Manager, importa en bloque todas las fuentes contenidas en un archivo `.opml` estándar, el formato con el que los lectores de RSS exportan sus listas. Al terminar, Titan te dice cuántos feeds ha añadido.

---
