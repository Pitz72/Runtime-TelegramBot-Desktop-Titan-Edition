## Capítulo 9: Solución de problemas

Aquí tienes los problemas más comunes y cómo salir de ellos, en formato problema y solución.

**La ventana está en blanco al arrancar.** Ocurre pocas veces, y casi solo en máquinas virtuales u ordenadores sin tarjeta gráfica actualizada. Espera una decena de segundos: Titan tiene un paracaídas que, si la interfaz no aparece por sí sola, la fuerza de todos modos. Si sigue en blanco, reinstala la aplicación sobre la anterior: no pierdes ningún dato, porque la base de datos se guarda en una carpeta del sistema separada del programa (la ruta exacta está en el Capítulo 7).

**He añadido un feed de YouTube y en los registros leo «Cannot read properties…».** El enlace entre Titan y YouTube (*InnerTube*) no es oficial: lee las páginas como lo haría un navegador. De vez en cuando Google cambia el código de sus páginas y trastorna esta lectura. El error aparece en el registro y el panel de mando te lo señala con una notificación. Mientras tanto, desactiva el canal de YouTube en cuestión y espera una actualización: Titan se actualiza solo (Capítulo 2) y el problema suele resolverse de raíz. Tus Noticias y tus Podcasts, entretanto, siguen funcionando sin problemas.

**El bot avisa «Bad Request: chat not found».** El Channel ID es erróneo o, más a menudo, has olvidado añadir el bot a los **Administradores** del canal. Solúcionalo: ábrelo en los ajustes del canal de Telegram, añade el bot como administrador y dale permiso para enviar mensajes. El error desaparece (véase también el Capítulo 4).

**Hago doble clic en el icono y no se abre una segunda ventana: vuelve al primer plano la que ya estaba.** Es intencionado. Titan admite una sola instancia a la vez: si el programa ya se está ejecutando, el segundo arranque no abre nada y se limita a traer delante la ventana existente, restaurándola si estaba minimizada. La razón es concreta: dos instancias abrirían la misma base de datos y harían girar dos motores independientes sobre los mismos feeds, con el resultado de publicar dos veces el mismo contenido en el canal.

**El bot publica las noticias pero la imagen aparece como un cuadradito pequeño en lugar de una vista previa grande.** Es el comportamiento normal de Telegram cuando la fuente RSS no contiene una imagen grande, sino solo una miniatura. Titan busca la imagen en la resolución más alta que consigue encontrar, llegando a escarbar en el texto del artículo, pero si la fuente no tiene una adecuada, Telegram recurre a la miniatura. Para corregirlo hay que intervenir en el sitio que publica el feed, no en el bot.

---
