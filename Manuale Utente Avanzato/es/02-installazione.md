## Capítulo 2: Instalación y primer arranque

### 2.1 Requisitos del sistema
Titan Edition es ligero y funciona en Windows y Linux:

-   **Windows:** Windows 10 o superior (64 bits).
-   **Linux:** Ubuntu 22.04+, Debian y derivadas mediante el paquete `.deb`; en las demás distribuciones usa el formato `.AppImage`, autónomo y sin instalación.

*Nota Linux:* en algunas versiones recientes de Ubuntu, el `.AppImage` necesita el paquete `libfuse2`; si no arranca, instálalo (`sudo apt install libfuse2`) o usa el `.deb`.

*Nota para servidores VPS:* Titan también puede ejecutarse en un Virtual Private Server sin tarjeta gráfica dedicada. Si al arrancar la interfaz no aparece, un mecanismo de seguridad la fuerza al cabo de una decena de segundos (hablamos de ello en el Capítulo 9).

### 2.2 Instalación
La instalación es sencilla.

1. Descarga el instalador desde la página de versiones del proyecto. Como alternativa puedes compilarlo tú mismo a partir del código fuente.
2. **En Windows:** ejecuta el archivo `.exe` y sigue las instrucciones en pantalla. El programa crea por sí solo un acceso directo en el escritorio.
3. **En Linux:** con el paquete `.deb` haz doble clic y deja que se encargue el gestor de paquetes; con el `.AppImage`, haz el archivo ejecutable (clic derecho → Propiedades → Permisos → Permitir la ejecución) y ábrelo con un doble clic.

Una vez instalado, no tendrás que descargar nada más a mano: Titan comprueba por sí mismo si existe una versión más reciente y, cuando la encuentra, te lo avisa con una pantalla dedicada que te pregunta si descargarla y, terminada la descarga, si reiniciar para instalarla.

![El aviso de actualización disponible: Titan pide confirmación antes de descargar y antes de reiniciar.](screenshots/11-update-available.png)

### 2.3 El Setup Wizard (primer arranque)
En el primer arranque, tras la secuencia animada de boot y la elección del idioma, Titan te recibe con un asistente de configuración (Setup Wizard) en cuatro pasos, para dejar lista enseguida tu primera automatización.

![El asistente de configuración guía la puesta en marcha del primer bot en cuatro pasos.](screenshots/02-setup-wizard.png)

1.  **Nombre del Bot:** un nombre descriptivo que te ayude a reconocer el perfil dentro de la interfaz (p. ej. «Bot Noticias Deportivas»). No será visible para tus usuarios en Telegram.
2.  **Token del Bot:** pega aquí el token secreto generado por `@BotFather`. *(Cómo obtenerlo se explica en el Capítulo 4.2.)*
3.  **ID del Canal (Channel ID):** el nombre de usuario público del canal precedido por la arroba (p. ej. `@micanal`). Si el canal es privado, introduce su identificador numérico, que suele empezar por el signo menos (p. ej. `-100123456789`).
4.  **Fecha de Inicio (Start Date):** un parámetro importante. Por defecto es la fecha de hoy: Titan leerá igualmente tus feeds, pero **ignorará y descartará** cualquier noticia o vídeo publicado antes de esta fecha. Sirve para evitar que, en el primer arranque, el bot inunde el canal de noticias de hace semanas.

Completados los cuatro pasos, haz clic en **Lanzar Titan**: te encontrarás en el panel de mando principal.

### 2.4 La pantalla de bienvenida: idioma, guía y manual
La pantalla de las ocho banderas no es solo del primer arranque: vuelve en cada encendido, y allí eliges el idioma de la interfaz, que cambia al instante. El botón **Lanzar Titan** te lleva dentro.

Bajo ese botón hay tres atajos:

-   **Guía Rápida** abre en pantalla un resumen de pocas páginas, en el idioma elegido: cómo obtener el token de @BotFather, los cuatro pasos del asistente, cómo añadir una fuente, cómo personalizar los mensajes y cómo encender el motor. Está pensada para quien quiere empezar de inmediato, sin leer este manual.
-   **Descargar Manual (PDF)** abre en el navegador del sistema el manual completo — el que estás leyendo — en tu idioma. El archivo no está dentro de la aplicación: se recoge de la red en ese momento, así que hace falta una conexión activa.
-   **Apoya el proyecto** abre la página para una donación libre. Titan es gratuito y de código abierto: la donación es opcional y no desbloquea nada.

Las dos entradas de documentación las vuelves a encontrar en los Ajustes del Sistema, en la pestaña **General** (Capítulo 8.2).

### 2.5 Después de una actualización: la pantalla «Novedades»
Cuando Titan se ha actualizado, el primer arranque de la nueva versión muestra una pantalla completa que enumera lo que ha cambiado: correcciones, funciones nuevas, comportamientos modificados. El número de versión está destacado, la lista está en tu idioma, y el botón **Continuar** la cierra.

Aparece una sola vez por versión: cerrada esa, no la vuelves a ver hasta que llega la actualización siguiente. Si una versión no trae su propia lista, en su lugar hay una línea genérica que señala correcciones y mejoras de estabilidad.


---
