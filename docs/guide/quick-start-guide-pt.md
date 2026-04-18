# Runtime TelegramBot — Guia de Início Rápido

Bem-vindo ao **Runtime TelegramBot** (Titan Edition). Este guia permite que você configure seu primeiro bot e comece a publicar conteúdo no seu canal do Telegram em poucos minutos.

---

## 1. Obter o Token do Telegram

Antes de iniciar o aplicativo, você precisa criar um bot no Telegram:

1. Abra o Telegram e procure por **@BotFather** (ele tem o selo azul de verificação).
2. Envie o comando `/newbot` e siga as instruções para atribuir um nome ao bot.
3. O @BotFather irá retornar um **Token de API** (ex. `123456789:ABCdefGHIjklMNOpqr...`). Copie-o.
4. Adicione o bot ao seu canal do Telegram como **Administrador** com permissão para enviar mensagens.

---

## 2. Primeiro Acesso — Configuração do Bot

No primeiro acesso, clique em **"+ Novo Bot"** e preencha os campos:

- **Nome** — um nome para identificar o bot na interface (ex. *Canal de Notícias*).
- **Token** — o Token de API fornecido pelo @BotFather.
- **Channel ID** — o nome do canal (ex. `@meucanal`) ou o ID numérico para canais privados (ex. `-100123456789`).
- **Data de Início** — o bot ignorará todos os conteúdos publicados antes desta data. Útil para evitar inundar o canal com artigos antigos.

---

## 3. Adicionar Feeds (Feed Manager)

No painel do bot, clique em **"+ Adicionar Feed"**:

1. Atribua um **Nome** descritivo ao feed.
2. Selecione o **Tipo**: News, Podcast ou YouTube.
3. Cole a **URL**:
   - News / Podcast: URL do feed RSS.
   - YouTube: URL do canal ou handle (ex. `@RuntimeRadio`). *Nenhuma API Key necessária.*
4. Use **Testar (⚡)** para verificar a validade do link, depois **Salvar**.

### Opções avançadas de feed

- **Filtro por Palavras-Chave (F4)** — Filtra artigos por palavras-chave a incluir ou excluir. Pode ser ativado nas configurações do feed. Um badge âmbar indica o filtro ativo.
- **Intervalo Personalizado (F5)** — Define um intervalo de busca individual para o feed (de 5 minutos a 24 horas), independente do intervalo global do bot.
- **Digest Mode (F9)** — Em vez de publicar cada artigo individualmente, acumula o conteúdo por um intervalo configurável (1h, 6h, 12h, 24h, 7d) e o envia em uma única mensagem resumo. Um badge roxo indica o modo ativo.
- **Importar OPML (F8)** — Importa vários feeds de uma vez a partir de um arquivo `.opml` padrão pelo botão OPML no Feed Manager.

---

## 4. Personalizar Mensagens (Template)

Vá nas configurações do bot → aba **Template**:

- Use os **Smart Chips** para inserir variáveis dinâmicas: `{{title}}`, `{{link}}`, `{{summary}}`, `{{feedName}}`, etc.
- Estão disponíveis 4 templates separados: Inicialização, News, Podcast, YouTube.
- O **Validador** sinaliza em tempo real eventuais erros (tags não balanceadas, chips desconhecidos, links não seguros).
- O botão **Prévia (F7)** mostra como a mensagem aparecerá com dados de exemplo, sem sair do editor.

Tags HTML suportadas pelo Telegram: `<b>`, `<i>`, `<code>`, `<a href="...">`.

---

## 5. Iniciar — Ignition

Quando o bot está configurado e os feeds foram adicionados:

- Clique no botão **Play (▶)** no console.
- O anel de status começará a girar e o bot entrará em funcionamento.
- No painel **System Logs** você verá em tempo real a busca dos feeds e a publicação no Telegram.

Para monitorar vários bots simultaneamente, use o toggle **ALL BOTS / THIS BOT** no log.

---

## 6. Estatísticas (F6)

Clique no ícone **Analytics (📊)** no painel para ver:

- Contadores de artigos publicados: hoje / últimos 7 dias / total.
- Detalhamento por feed, ordenado por volume de publicação.

---

## Configurações do Sistema

Acessíveis pelo ícone de engrenagem no canto superior direito:

- **Geral** — intervalo de verificação global, horas de silêncio, idioma.
- **Backup** — exportação e restauração do banco de dados.
- **Performance Mode** — desabilita efeitos que consomem GPU (scanlines, blur, glow, animações). Útil em máquinas com hardware limitado. Efetivo imediatamente sem reinicialização.

---

## Portabilidade — Arquivo .rtb

Para mover um bot para outro computador sem perder a configuração:

1. Nas configurações do bot → **Exportar (.rtb)**.
2. Transfira o arquivo para o novo PC.
3. No novo PC → **Importar (.rtb)** e insira o token novamente (os tokens são específicos da máquina por segurança).

---

## Solução de Problemas

- **Erros no YouTube** — O Google atualiza periodicamente seus servidores. Se aparecerem erros vermelhos nos feeds do YouTube, desative temporariamente o feed e aguarde uma atualização do aplicativo.
- **Token inválido** — Verifique se o bot foi adicionado ao canal como administrador com permissão para enviar mensagens.
- **Linux sem libsecret** — O aplicativo funciona normalmente usando o fallback AES-256-GCM. Para o chaveiro nativo instale: `sudo apt-get install libsecret-1-0`.
- **macOS — aviso do Gatekeeper** — No primeiro acesso: clique com o botão direito no aplicativo → Abrir → Abrir.

---

*Para o guia completo consulte o Manual do Usuário disponível em formato PDF.*
