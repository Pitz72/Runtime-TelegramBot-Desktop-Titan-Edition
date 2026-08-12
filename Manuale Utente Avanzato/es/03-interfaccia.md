## Capítulo 3: La interfaz de usuario (el panel de mando)

### 3.1 Anatomía de la consola
Terminado el Setup Wizard, y en cada arranque posterior, te recibe el panel de mando de Titan: una interfaz de aspecto acristalado, dividida en dos mitades (la disposición 50/50).

-   **Mitad izquierda (configuración).** Alberga el **Bot Selector** (la barra lateral por la que te desplazas y seleccionas el perfil de bot que quieres ver) y el **Feed Manager**, es decir, la lista de fuentes asociadas al bot seleccionado. Es aquí donde le dices al software qué debe buscar.
-   **Mitad derecha (operación).** La zona de ejecución: el botón **Ignition** (el gran botón Play central que enciende y apaga el motor), los contadores de envíos y la consola negra de los **Registros del Sistema** (System Logs), que muestra línea por línea lo que está haciendo el bot en tiempo real.

En la parte superior de la mitad derecha, una barra muestra el logo, el nombre y la versión instalada; a la derecha están el indicador **en línea/desconectado** (cuando hay un bot seleccionado) y el icono de engranaje que abre los Ajustes del Sistema (Capítulos 7 y 8).

![El panel de mando con el motor encendido: los bots a la izquierda, las fuentes en el centro, la ejecución y los registros a la derecha.](screenshots/03-dashboard-online.png)

*Consejo.* Una vez pulsado Play no importa qué bot estés mirando: con el motor encendido, Titan trabaja en segundo plano sobre **todos** los bots activos a la vez. La selección de la izquierda solo te sirve a ti, para consultar la configuración de ese perfil.

### 3.2 El panel «Registros del Sistema»
La consola de los registros, abajo a la derecha, es el reflejo directo del motor asíncrono. Permanece en inglés aunque la interfaz esté en otro idioma: así los mensajes siguen siendo un estándar técnico universal, cómodo cuando tienes que pedir asistencia.

![La consola de los Registros del Sistema muestra en tiempo real, línea por línea, lo que hace el motor.](screenshots/14-log-console.png)

Los mensajes están codificados por colores para una lectura rápida:

-   🟢 **Verde (`Sent` / `Found New Item`):** se ha encontrado y enviado a Telegram un elemento nuevo.
-   🟡 **Amarillo/naranja (`Skipped` / `FloodWait`):** el motor ha ignorado un elemento (por ejemplo por ser anterior a la *Fecha de Inicio*) o Telegram ha pedido una pausa anti-spam, que el bot gestiona solo.
-   🔴 **Rojo (`Error` / `Failed`):** un error crítico, como una conexión interrumpida, un Token API erróneo o un cambio en los servidores de YouTube.
-   ⚪ **Gris/blanco (`Fetching` / `No updates`):** administración rutinaria. El bot está leyendo la fuente pero no ha encontrado nada nuevo desde la última revisión.

La barra en la parte superior del panel ofrece tres comandos:

-   **Todos / Este Bot:** filtra el flujo mostrando todos los bots o solo el seleccionado, cómodo cuando tienes muchos activos a la vez.
-   **Exportar:** guarda todo el registro en un archivo `.txt`, indispensable si tienes que pasárselo a un técnico para una revisión.
-   **Limpiar:** vacía la vista de los registros. No toca el historial de envíos, solo lo que ves en pantalla.

### 3.3 Entender las estadísticas
A los lados del botón de encendido, la interfaz muestra tres números: **Hoy (Today)**, **7 Días (Week)** y **Total**. Se actualizan solos cada 30 segundos mientras el motor funciona y cuentan solo los **mensajes enviados con éxito** en el bot seleccionado.

Junto al Total hay un icono de gráfico: ábrelo para ver el panel de detalle. Además de esos mismos tres números, te muestra el reparto **por fuente**: qué feed ha producido cuántos envíos, del más activo al menos activo. Así ves de un vistazo qué fuentes alimentan de verdad el canal.

![El panel de detalle de las estadísticas, con el reparto de envíos por fuente.](screenshots/07-stats-modal.png)

*Nota.* Si usas el botón **Borrar Historial** (Clear History) en los ajustes del bot, estos contadores también vuelven a cero: el historial de envíos se elimina.

---
