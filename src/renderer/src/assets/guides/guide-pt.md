# ⚡ Titan Desktop: Guia de Início Rápido

Bem-vindo ao **Runtime TelegramBot Titan Edition**. Este guia rápido permitirá que você defina seu primeiro bot e comece a publicar conteúdo no seu canal do Telegram em menos de 3 minutos.

---

## 1. Preparação: Obtenha o Token do Telegram
Antes de iniciar o Titan, você deve criar um "Bot" no Telegram:
1. Abra o Telegram e pesquise pelo usuário **@BotFather** (tem o selo de verificação azul).
2. Envie o comando `/newbot` e siga as instruções para dar um nome ao seu bot.
3. No final, o @BotFather lhe dará um **API Token** (uma string longa como `123456789:ABCdefGHIjklMNOpqr...`). **Copie e guarde-o em um lugar seguro.**
4. Adicione o bot recém-criado ao seu Canal do Telegram como **Administrador** (ele deve ter permissão para "Enviar Mensagens").

## 2. A Primeira Execução (Assistente de Configuração)
Inicie o Titan Desktop. Se for sua primeira vez, o assistente de 4 etapas aparecerá:
*   **Nome do Bot:** Escolha um nome para reconhecê-lo (ex., *Canal de Notícias*).
*   **Bot Token:** Cole o Token fornecido pelo @BotFather.
*   **ID do Canal:** Digite o nome do seu canal (ex., `@meucanal`). Se for um canal privado, digite o ID numérico (ex., `-100123456789`).
*   **Data de Início:** Escolha uma data. O bot **ignorará** todos os artigos e vídeos publicados antes desta data, evitando inundar seu canal com conteúdo antigo.

## 3. Adicionar Fontes (Gerenciador de Feed)
Depois de entrar no Painel:
1. Certifique-se de que seu bot esteja selecionado na coluna da esquerda.
2. No painel **Fontes de Feed**, clique em **"+ Adicionar Fonte"**.
3. Digite o Nome (ex., *Meu Podcast*) e selecione o **Tipo** (Podcast, Notícias ou YouTube).
4. Cole o URL:
   * Para Notícias e Podcasts: cole o URL do feed RSS.
   * Para YouTube: Você pode colar diretamente o URL do canal ou o identificador (ex., `@RuntimeRadio`). *Nenhuma chave de API necessária!*
5. Use o botão **Testar (⚡)** para verificar se o link é válido e clique em **Salvar**.

## 4. Personalizar Mensagens (Modelos)
Quer que suas postagens sejam perfeitamente formatadas?
1. Clique no ícone de **Configurações (⚙️)** na coluna da esquerda.
2. Vá para a guia **Modelos**.
3. Use o prático painel de botões na parte superior para inserir variáveis automáticas como `{{title}}`, `{{link}}` ou `{{summary}}`.
4. Você pode usar tags HTML básicas suportadas pelo Telegram, por exemplo: `<b>Negrito</b>`, `<i>Itálico</i>`, ou ocultar um link longo atrás de um texto usando `<a href="{{link}}">Clique aqui</a>`.

## 5. Ignição (Ligar)
Você digitou o token e adicionou os feeds? Você está pronto.
*   Clique no grande botão **Play (▶)** no centro do console.
*   O anel começará a girar e o bot entrará em ação.
*   No painel **System Logs**, você verá o bot em tempo real lendo suas fontes e publicando novos conteúdos no Telegram!

---

### 💡 Dicas Úteis & Solução de Problemas
*   **Horários de Silêncio:** Nas configurações do bot, você pode definir o horário de atividade. Se você definir das 08:00 às 22:00, as notícias da noite não serão perdidas, mas entrarão na fila e serão publicadas às 08:00 da manhã!
*   **Erros do YouTube:** Se você receber erros "vermelhos" em canais do YouTube, não entre em pânico. O Google atualiza frequentemente seus servidores. Desligue temporariamente o feed do YouTube a partir do botão dedicado na interface e aguarde nossa atualização de software.
*   **Troca de PC:** Você precisa mover o bot para outro computador? Não copie os arquivos! Use a função **Exportar (.rtb)** nas configurações. Isso gerará um arquivo seguro para importar para o novo PC, mantendo suas senhas criptografadas.

*Para assistência avançada, consulte o Manual do Usuário Pro em formato PDF.*
