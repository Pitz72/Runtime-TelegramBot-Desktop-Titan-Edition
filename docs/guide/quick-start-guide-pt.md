# Runtime TelegramBot Desktop Titan Edition — Guia de Início Rápido

Bem-vindo ao **Runtime TelegramBot Desktop Titan Edition**. Este guia permite-lhe configurar o seu primeiro bot e começar a publicar conteúdo no seu canal do Telegram em poucos minutos.

---

## 1. Obter o Token do Telegram

Antes de iniciar a aplicação, precisa de criar um bot no Telegram:

1. Abra o Telegram e procure por **@BotFather** (ele tem o selo azul de verificação).
2. Envie o comando `/newbot` e siga as instruções para atribuir um nome ao bot.
3. O @BotFather irá retornar um **Token de API** (ex. `123456789:ABCdefGHIjklMNOpqr...`). Copie-o.
4. Adicione o bot ao seu canal do Telegram como **Administrador** com permissão para enviar mensagens.

---

## 2. Primeiro Acesso — Configuração do Bot

No primeiro acesso, clique em **«+ Novo Bot»** e preencha os campos:

- **Nome** — um nome para identificar o bot na interface (ex. *Canal de Notícias*).
- **Token** — o Token de API fornecido pelo @BotFather.
- **Channel ID** — o nome do canal (ex. `@meucanal`) ou o ID numérico para canais privados (ex. `-100123456789`).
- **Data de Início** — o bot ignorará todos os conteúdos publicados antes desta data. Útil para evitar inundar o canal com artigos antigos.

---

## 3. Adicionar Feeds (Feed Manager)

No painel do bot, clique em **«+ Adicionar Feed»**:

1. Atribua um **Nome** descritivo ao feed.
2. Selecione o **Tipo**: News, Podcast ou YouTube.
3. Cole a **URL**:
   - News / Podcast: URL do feed RSS.
   - YouTube: URL do canal ou handle (ex. `@RuntimeRadio`). *Nenhuma API Key necessária.*
4. Use **Testar (⚡)** para verificar a validade do link, depois **Guardar**.

### Opções avançadas de feed

- **Filtro por Palavras-Chave** — Filtra artigos por palavras-chave a incluir ou excluir. Pode ser ativado nas definições do feed. Um badge âmbar indica o filtro ativo.
- **Intervalo Personalizado** — Define um intervalo de procura individual para o feed (de 5 minutos a 24 horas), independente do intervalo global do bot.
- **Digest Mode** — Em vez de publicar cada artigo individualmente, acumula o conteúdo durante um intervalo configurável (1h, 6h, 12h, 24h, 7d) e envia-o numa única mensagem resumo. Um badge roxo indica o modo ativo.
- **Importar OPML** — Importa vários feeds de uma só vez a partir de um ficheiro `.opml` padrão pelo botão OPML no Feed Manager.

---

## 4. Personalizar Mensagens (Template)

Vá às definições do bot → separador **Template**:

- Use os **Smart Chips** para inserir variáveis dinâmicas: `{{title}}`, `{{link}}`, `{{summary}}`, `{{feedName}}`, etc.
- Estão disponíveis 4 templates separados: Inicialização, News, Podcast, YouTube.
- O **Validador** sinaliza em tempo real eventuais erros (tags não balanceadas, chips desconhecidos, links não seguros).
- O botão **Prévia** mostra como a mensagem aparecerá com dados de exemplo, sem sair do editor.

Tags HTML suportadas pelo Telegram: `<b>`, `<i>`, `<code>`, `<a href="...">`.

---

## 5. Iniciar — Ignition

Quando o bot está configurado e os feeds foram adicionados:

- Clique no botão **Play (▶)** na consola.
- O anel de estado começará a girar e o bot entrará em funcionamento.
- No painel **System Logs** verá em tempo real a procura dos feeds e a publicação no Telegram.

Para monitorizar vários bots em simultâneo, use o toggle **ALL BOTS / THIS BOT** no registo.

---

## 6. Estatísticas

Clique no ícone **Analytics (📊)** no painel para ver:

- Contadores de artigos publicados: hoje / últimos 7 dias / total.
- Repartição por feed, ordenada por volume de publicação.

---

## Definições do Sistema

Acessíveis pelo ícone de roda dentada no canto superior direito:

- **Geral** — intervalo de verificação global, horas de silêncio, idioma.
- **Backup** — exportação e restauração da base de dados.
- **Modo Desempenho** — desativa efeitos que consomem GPU (scanlines, blur, glow, animações). Útil em máquinas com hardware limitado. Efetivo de imediato sem reiniciar.

---

## Portabilidade — Ficheiro .rtb

Para mover um bot para outro computador sem perder a configuração:

1. Nas definições do bot → **Exportar (.rtb)**.
2. Transfira o ficheiro para o novo PC.
3. No novo PC → **Importar (.rtb)** e volte a introduzir o token (os tokens são específicos da máquina por segurança).

---

## Resolução de Problemas

- **Erros no YouTube** — O Google atualiza periodicamente os seus servidores. Se aparecerem erros vermelhos nos feeds do YouTube, desative temporariamente o feed e aguarde uma atualização da aplicação.
- **Token inválido** — Verifique se o bot foi adicionado ao canal como administrador com permissão para enviar mensagens.
- **Linux sem libsecret** — A aplicação funciona normalmente usando o fallback AES-256-GCM. Para o chaveiro nativo instale: `sudo apt-get install libsecret-1-0`.

---

**Runtime TelegramBot Desktop · Titan Edition** é software livre, publicado sob licença **MIT**: pode utilizá-lo, estudá-lo, modificá-lo e redistribuí-lo.

A maior parte do código foi escrita com modelos de linguagem (Google Gemini, Anthropic Claude). A conceção, a direção do projeto e a verificação são de Simone Pizzi.

Para o tratamento completo consulte o **Manual do Utilizador Avançado** em PDF, disponível em oito idiomas.

Contactos: simonepizzi.runtimeradio.it/contatti
Donativo livre: paypal.me/runtimeradio
