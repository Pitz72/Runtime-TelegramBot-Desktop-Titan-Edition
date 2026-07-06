## Capítulo 4: Gestão de bots e canais

### 4.1 Criar vários bots
O Titan é multicanal: pode gerir vários bots a partir da mesma janela, cada um com o seu canal. Suponha que gere uma rádio: precisa de um canal do Telegram para as notícias escritas (News), um para os episódios em áudio (Podcast) e talvez um terceiro para os bastidores (YouTube). Não é preciso instalar o programa três vezes.

No topo da coluna dos bots, à direita, há um pequeno grupo de comandos. O **+** abre um formulário rápido: introduza Nome, Token, ID do Canal e Data de Início, guarda, e o novo perfil aparece na lista. Junto ao **+** encontra também o botão para **importar** um bot a partir de um ficheiro `.rtb` (Capítulo 7) e o de cursores (🎚️) para abrir as suas **definições** (Capítulo 6).

Cada perfil vive por conta própria: feeds, horários e modelos são separados. Quando prime o Play, o Titan orquestra todos os bots ativos num único ciclo de trabalho, servindo-os à vez.

![O Bot Selector: cada perfil mostra o seu nome, o seu canal e o seu estado online/offline.](screenshots/12-bot-selector.png)

### 4.2 Obter o Token do @BotFather
O **Bot Token** (token do bot) é a «chave de casa» que permite ao software falar com os servidores do Telegram. Para obter um precisa do Telegram, no telemóvel ou no computador:

1. Na pesquisa do Telegram escreva `BotFather` e abra o perfil oficial, reconhecível pelo visto azul de verificação.
2. Prima **Iniciar** e envie o comando `/newbot`.
3. O BotFather pede-lhe primeiro um «Nome» (o que os utilizadores vão ler), depois um «Username» único, que deve terminar com a palavra *bot* (por exemplo `minharadio_news_bot`).
4. Se o username estiver livre, o BotFather responde com uma mensagem de parabéns que contém uma longa cadeia alfanumérica, sob a indicação *Use this token to access the HTTP API*.
5. Copie essa cadeia: é o token a colar no Titan.

**Importante.** Nunca partilhe o Token. O Titan guarda-o cifrado, associando-o a este computador através do porta-chaves do sistema operativo: assim, mesmo copiando os ficheiros do programa para outra máquina, o token permanece ilegível. Para o mover mesmo para outro PC existe o formato `.rtb`, explicado no Capítulo 7.

### 4.3 Encontrar o Channel ID correto
Para publicar, o bot tem de saber *onde* enviar as mensagens: é o **Channel ID** (ID do canal).

-   **Canais públicos.** É o caso mais simples. Se o canal tem uma ligação do tipo `t.me/omeucanal`, o Channel ID é `@omeucanal`. Nem sequer precisa de ser rigoroso: o Titan limpa sozinho o que colar: retira o prefixo `https://` e `t.me/`, e acrescenta a arroba se faltar. Assim `https://t.me/omeucanal`, `t.me/omeucanal` e `omeucanal` acabam todos como `@omeucanal`.
-   **Canais privados.** Não têm nome público: são identificados por uma cadeia numérica atribuída pelo Telegram, que costuma começar pelo sinal menos (por exemplo `-1002345678912`). Para a obter, reencaminhe uma mensagem do canal para um bot de serviço gratuito como `@getidsbot`, que lhe responde com o código numérico exato da conversa. Este número cola-se tal como está.

*Regra de ouro.* Depois de criado o canal e obtido o ID, e **antes de arrancar o bot**, entre nas definições do canal do Telegram, abra **Administradores**, procure o seu bot e adicione-o com a permissão de enviar mensagens. Se o bot não for administrador (ou o ID estiver errado), não tem forma de escrever no canal: nos registos aparecerá um erro vermelho do Telegram (vemo-los no Capítulo 9) e nada será publicado.

---
