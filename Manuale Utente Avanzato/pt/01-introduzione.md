## Capítulo 1: Introdução e conceitos básicos

### 1.1 O que é o Titan Edition?
Bem-vindo ao **Runtime TelegramBot Titan Edition**. Não é um simples «script» que copia e cola ligações: é uma ferramenta de automação editorial que lê as suas fontes (feeds RSS, podcasts, canais do YouTube) e publica os novos conteúdos no seu canal do Telegram sem que tenha de as seguir à mão.

Foi pensado para quem gere comunidades, órgãos de comunicação, estações de rádio ou canais do YouTube e precisa de distribuir conteúdos de forma atempada e contínua.

A diferença face aos serviços Cloud comerciais está em onde é executado. Estes vivem em servidores alheios, muitas vezes com uma subscrição mensal e um limite de mensagens que pode enviar. O Titan é executado **localmente**, no seu computador ou no seu servidor: os seus dados e as suas credenciais permanecem na sua máquina, não paga qualquer mensalidade e nenhum plano comercial lhe limita o número de envios. Restam apenas os limites anti-spam habituais do Telegram, que o Titan gere sozinho.

![O ecrã de boas-vindas que recebe o utilizador ao iniciar o Titan Edition.](screenshots/01-intro-welcome.png)

### 1.2 O ecossistema «por baixo do capô»
Para tirar o máximo partido, basta apreender dois conceitos sobre a forma como o Titan gere a informação.

-   **Motor assíncrono (Producer-Consumer).** O Titan mantém separadas duas tarefas: uma transfere continuamente os artigos das suas fontes, a outra formata-os e envia-os ao Telegram. Assim, a transferência nunca para à espera do envio, e o envio respeita as pausas que o Telegram impõe para não o bloquear como spam, o chamado *FloodWait*.
-   **A base de dados e a «memória» do bot.** Sempre que publica um artigo ou um vídeo, o Titan calcula uma impressão digital (um hash MD5) e regista-a na sua base de dados interna. É esta memória que o impede de voltar a publicar duas vezes a mesma notícia, mesmo que desligue o computador durante dois dias e o volte a ligar.

---
