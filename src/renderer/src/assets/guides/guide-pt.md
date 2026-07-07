# ⚡ Titan Desktop: Guia de Início Rápido

Bem-vindo ao **Runtime TelegramBot Titan Edition**. Este guia rápido permite-lhe configurar o seu primeiro bot e começar a publicar conteúdo no seu canal do Telegram em menos de 3 minutos.

---

## 1. Preparação: Obtenha o Token do Telegram
Antes de iniciar o Titan, deve criar um «Bot» no Telegram:
1. Abra o Telegram e procure o utilizador **@BotFather** (tem o selo de verificação azul).
2. Envie o comando `/newbot` e siga as instruções para dar um nome ao seu bot.
3. No final, o @BotFather dar-lhe-á um **API Token** (uma cadeia longa como `123456789:ABCdefGHIjklMNOpqr...`). **Copie-o e guarde-o num local seguro.**
4. Adicione o bot recém-criado ao seu Canal do Telegram como **Administrador** (deve ter permissão para «Enviar Mensagens»).

## 2. O Primeiro Arranque (Assistente de Configuração)
Inicie o Titan Desktop. Se for a primeira vez, aparecerá o assistente de 4 passos:
*   **Nome do Bot:** Escolha um nome para o reconhecer (ex., *Canal de Notícias*).
*   **Bot Token:** Cole o Token fornecido pelo @BotFather.
*   **ID do Canal:** Introduza o nome do seu canal (ex., `@meucanal`). Se for um canal privado, introduza o ID numérico (ex., `-100123456789`).
*   **Data de Corte:** Escolha uma data. O bot **ignorará** todos os artigos e vídeos publicados antes desta data, evitando inundar o seu canal com conteúdo antigo.

## 3. Adicionar Fontes (Gestor de Feed)
Depois de entrar no Painel:
1. Certifique-se de que o seu bot está selecionado na coluna da esquerda.
2. No painel **Fontes de Feed**, clique em **«+ Adicionar Fonte»**.
3. Introduza o Nome (ex., *O Meu Podcast*) e selecione o **Tipo** (Podcast, Notícias ou YouTube).
4. Cole o URL:
   * Para Notícias e Podcasts: cole o URL do feed RSS.
   * Para YouTube: pode colar diretamente o URL do canal ou o identificador (ex., `@RuntimeRadio`). *Nenhuma chave de API necessária!*
5. Use o botão **Testar (⚡)** para verificar se o link é válido e clique em **Guardar**.

## 4. Personalizar Mensagens (Modelos)
Quer que as suas publicações fiquem perfeitamente formatadas?
1. Clique no ícone de **Definições (⚙️)** na coluna da esquerda.
2. Vá ao separador **Modelos**.
3. Use o prático painel de botões na parte superior para inserir variáveis automáticas como `{{title}}`, `{{link}}` ou `{{summary}}`.
4. Pode usar tags HTML básicas suportadas pelo Telegram, por exemplo: `<b>Negrito</b>`, `<i>Itálico</i>`, ou ocultar um link longo atrás de um texto usando `<a href="{{link}}">Clique aqui</a>`.

## 5. Ignição (Ligar)
Já introduziu o token e adicionou os feeds? Está pronto.
*   Clique no grande botão **Play (▶)** no centro da consola.
*   O anel começará a girar e o bot entrará em ação.
*   No painel **System Logs**, verá o bot em tempo real a ler as suas fontes e a publicar novos conteúdos no Telegram!

---

### 💡 Dicas Úteis & Resolução de Problemas
*   **Horários de Silêncio:** Nas definições do bot, pode definir o horário de atividade. Se definir das 08:00 às 22:00, as notícias da noite não se perdem, mas entram na fila e são publicadas às 08:00 da manhã!
*   **Erros do YouTube:** Se receber erros «vermelhos» em canais do YouTube, não entre em pânico. O Google atualiza frequentemente os seus servidores. Desligue temporariamente o feed do YouTube a partir do botão dedicado na interface e aguarde a nossa atualização de software.
*   **Troca de PC:** Precisa de mover o bot para outro computador? Não copie os ficheiros! Use a função **Exportar (.rtb)** nas definições. Isto gera um ficheiro seguro para importar no novo PC, mantendo as suas palavras-passe encriptadas.

*Para assistência avançada, consulte o Manual do Utilizador Pro em formato PDF.*
