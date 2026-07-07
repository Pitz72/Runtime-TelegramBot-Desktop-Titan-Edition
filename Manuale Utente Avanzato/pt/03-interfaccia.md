## Capítulo 3: A interface do utilizador (o painel de comando)

### 3.1 Anatomia da consola
Terminado o Setup Wizard, e em cada arranque seguinte, recebe-o o painel de comando do Titan: uma interface de aspeto vidrado, dividida em duas metades (a disposição 50/50).

-   **Metade esquerda (configuração).** Alberga o **Bot Selector** (a barra lateral por onde percorre e seleciona o perfil de bot a visualizar) e o **Feed Manager**, ou seja, a lista de fontes associadas ao bot selecionado. É aqui que diz ao software o que procurar.
-   **Metade direita (operação).** A zona de execução: o botão **Ignition** (o grande botão Play central que liga e desliga o motor), os contadores de envios e a consola preta dos **Registos do Sistema** (System Logs), que mostra linha a linha o que o bot está a fazer em tempo real.

No topo da metade direita, uma barra mostra o logótipo, o nome e a versão instalada; à direita encontram-se o indicador **online/offline** (quando há um bot selecionado) e o ícone de roda dentada que abre as Definições do Sistema (Capítulos 7 e 8).

![O painel de comando com o motor ligado: os bots à esquerda, as fontes ao centro, a execução e os registos à direita.](screenshots/03-dashboard-online.png)

*Dica.* Depois de premido o Play, não importa que bot está a ver: com o motor ligado, o Titan trabalha em segundo plano sobre **todos** os bots ativos em simultâneo. A seleção à esquerda serve apenas para si, para consultar a configuração desse perfil.

### 3.2 O painel «Registos do Sistema»
A consola dos registos, em baixo à direita, é o reflexo direto do motor assíncrono. Permanece em inglês mesmo quando a interface está noutro idioma: assim as mensagens continuam a ser um padrão técnico universal, cómodo quando precisa de pedir assistência.

![A consola dos Registos do Sistema mostra em tempo real, linha a linha, o que o motor está a fazer.](screenshots/14-log-console.png)

As mensagens estão codificadas por cores para uma leitura rápida:

-   🟢 **Verde (`Sent` / `Found New Item`):** foi encontrado e enviado ao Telegram um elemento novo.
-   🟡 **Amarelo/laranja (`Skipped` / `FloodWait`):** o motor ignorou um elemento (por exemplo por ser anterior à *Data de Corte*) ou o Telegram pediu uma pausa anti-spam, que o bot gere sozinho.
-   🔴 **Vermelho (`Error` / `Failed`):** um erro crítico, como uma ligação interrompida, um Token API errado ou uma alteração nos servidores do YouTube.
-   ⚪ **Cinzento/branco (`Fetching` / `No updates`):** rotina normal. O bot está a ler a fonte mas não encontrou nada de novo desde a última verificação.

A barra no topo do painel oferece três comandos:

-   **Todos / Este Bot:** filtra o fluxo mostrando todos os bots ou apenas o selecionado, cómodo quando tem muitos ativos em simultâneo.
-   **Exportar:** guarda todo o registo num ficheiro `.txt`, indispensável se tiver de o entregar a um técnico para verificação.
-   **Limpar:** esvazia a vista dos registos. Não toca no histórico de envios, apenas no que vê no ecrã.

### 3.3 Compreender as estatísticas
Dos lados do botão de ligar, a interface mostra três números: **Hoje (Today)**, **7 dias (Week)** e **Total**. Atualizam-se sozinhos a cada 30 segundos enquanto o motor funciona e contam apenas as **mensagens enviadas com sucesso** no bot selecionado.

Junto ao Total há um ícone de gráfico: abra-o para o painel de detalhe. Além desses mesmos três números, mostra-lhe a repartição **por fonte**: que feed produziu quantos envios, do mais ativo ao menos ativo. Assim vê num relance que fontes alimentam mesmo o canal.

![O painel de detalhe das estatísticas, com a repartição dos envios por fonte.](screenshots/07-stats-modal.png)

*Nota.* Se usar o botão **Limpar Histórico** (Clear History) nas definições do bot, estes contadores também voltam a zero: o histórico de envios é eliminado.

---
