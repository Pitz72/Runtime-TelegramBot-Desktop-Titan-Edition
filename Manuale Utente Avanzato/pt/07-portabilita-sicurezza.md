## Capítulo 7: Portabilidade e segurança (o ecossistema OmniSync)

O Titan mantém o seu trabalho em segurança e dá-lhe três formas de o guardar ou mover: a cópia de segurança completa da base de dados, o formato `.rtb` para um único bot e a exportação de toda a configuração. Vejamo-las.

### 7.1 Cópia de segurança completa da base de dados
Clique no ícone de roda dentada (⚙️) no canto superior direito para abrir as **Definições do Sistema**, depois vá ao separador **Dados & Backup**.

O botão **Exportar BD** cria um clone completo da base de dados `titan.db`: lá dentro está tudo, os perfis de bots, os feeds e toda a memória histórica das publicações. Com **Importar BD** seleciona um ficheiro guardado anteriormente e o Titan reinicia sozinho, repondo a situação exata daquele momento.

![O separador Dados & Backup: exportação e importação da base de dados e da configuração.](screenshots/09-system-backup.png)

É o método adequado para uma cópia de segurança completa, ou para repor tudo de pé após uma reinstalação no mesmo computador.

*Onde vive a base de dados.* O ficheiro `titan.db` é guardado numa pasta do sistema, separada do programa, de modo que uma reinstalação não lhe toca. Encontra-o no Windows em `%APPDATA%\runtime-telegram-bot-titan-edition\`, no Linux em `~/.config/runtime-telegram-bot-titan-edition/`. Se um dia o software não arrancar, pode copiar o `titan.db` a partir daí à mão para o pôr a salvo.

### 7.2 O formato .rtb: mover um bot em segurança
Para passar um único bot de uma instalação para outra (por exemplo a um colega de redação) existe o **OmniSync**, o formato `.rtb` (Runtime Telegram Bot).

Nas definições do bot, na secção **Partilha**, o botão **Exportar** gera um ficheiro `.rtb`: uma «cartucha digital» que contém o nome do bot, todos os seus feeds (com filtros, intervalos e digests) e os modelos, mas não o histórico das mensagens já enviadas. Quem o recebe carrega-o com o botão **Importar** na coluna dos bots, o ícone de seta junto ao **+**.

E o token? Aqui o Titan toma uma decisão de segurança precisa: o token viaja no ficheiro, mas cifrado e associado ao computador que criou a exportação. Por isso:

-   **No mesmo computador** (por exemplo após uma reinstalação), o token é relido e reposto sem que faça nada.
-   **Noutro computador**, o token, por segurança, não é decifrável: chega vazio e tem de ser reintroduzido à mão, o mesmo que copia do BotFather. Todo o resto (feeds, modelos, definições) já está no seu lugar.

Na prática, o `.rtb` move a configuração de forma cómoda, mas o verdadeiro segredo não se rouba copiando um ficheiro: permanece protegido pela máquina que o gerou.

*Nota para Linux.* A cifragem do token apoia-se no porta-chaves do sistema (GNOME Keyring, KWallet ou outro serviço Secret Service). Se a sua distribuição não tiver nenhum, o Titan não se bloqueia: usa uma cifragem interna, também associada à máquina. Para ativar o porta-chaves nativo, instale o `libsecret`.

### 7.3 Exportar todos os bots juntos (configuração)
Se quiser mover não um bot mas todo o conjunto, volte ao separador **Dados & Backup**: junto à base de dados encontra a exportação da **configuração** em formato JSON. Funciona como o `.rtb`, mas sobre todos os bots de uma vez: leva consigo os perfis, os feeds e os modelos de cada um, sempre sem o histórico. Vale a mesma regra do token vista acima: repõe-se sozinho no mesmo computador, noutro sítio tem de ser reintroduzido.

---
