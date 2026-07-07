## Capítulo 6: Definições avançadas e modelos

As definições de cada bot abrem-se a partir do ícone de cursores (🎚️) junto ao seu nome, na coluna da esquerda. A janela tem dois separadores: **Geral** (os parâmetros do bot) e **Modelos** (o aspeto das mensagens).

### 6.1 Intervalo de verificação e notificações
No separador **Geral**, além dos dados que já conhece (Nome, Token, ID do Canal, Data de Corte), há duas regulações que decidem o comportamento do bot:

-   **Intervalo de Verificação.** Um cursor de 1 a 120 minutos (15 por predefinição) que estabelece de quanto em quanto tempo o bot vai verificar os feeds. É o ritmo de base; se uma fonte concreta precisar de um passo diferente, dá-lho a partir do Feed Manager (Capítulo 5).
-   **Notificações.** Um interruptor: quando está ligado, o Titan faz aparecer um aviso do sistema (uma notificação do ambiente de trabalho) em cada publicação bem-sucedida. Se gere canais muito ativos e não quer ser avisado a cada publicação, desligue-o.

Junto ao campo Token, um ícone em forma de olho permite-lhe mostrá-lo ou ocultá-lo enquanto o cola.

![O separador Geral das definições do bot: intervalo de verificação, notificações e horário ativo.](screenshots/04-bot-settings-general.png)

### 6.2 Faixas horárias de silêncio (Horário Ativo)
Os jornais estrangeiros e os criadores internacionais publicam muitas vezes a meio da noite, e uma notificação push às três da manhã não agrada a ninguém. As faixas horárias de silêncio servem precisamente para isto.

Ainda no separador **Geral**, a secção **Horário Ativo** tem dois campos: **Das** (p. ex. 08:00) e **Até** (p. ex. 22:00). Por predefinição a janela vai das 00:00 às 23:59, ou seja, nenhum silêncio: é você que a estreita.

-   *Fora da janela.* O motor não para: continua a verificar os feeds RSS e YouTube toda a noite, para não perder nada. Só que, em vez de enviar de imediato, põe os conteúdos de parte numa fila de espera **persistente**, guardada em disco. Mesmo que desligue o computador, a fila continua lá ao reiniciar.
-   *À reabertura.* Assim que o relógio volta a entrar na faixa permitida, o bot despacha por ordem cronológica tudo o que acumulou, publicando uma mensagem a cada 3 segundos até esgotar a fila.

Assim as suas automações respeitam o descanso do público e o conteúdo chega de manhã, quando tem mais probabilidades de ser lido.

### 6.3 Editor de modelos e Smart Chips
Por predefinição o Titan publica com uma disposição limpa mas padrão. Se quiser dar às mensagens a sua linha editorial (um emoji como logótipo, as ligações dispostas à sua maneira), abra o separador **Modelos**.

Encontra quatro áreas de texto separadas, uma por formato: **Arranque**, **News**, **Podcast**, **YouTube**. Escrevem-se no **HTML suportado pelo Telegram**: as etiquetas úteis são `<b>` (negrito), `<i>` (itálico), `<code>` (monoespaço) e `<a href="...">` (ligação).

![O separador Modelos com o editor, os Smart Chips para as variáveis e a pré-visualização da mensagem.](screenshots/05-bot-settings-templates.png)

Por cima de cada área, os botões **Smart Chips** inserem as variáveis dinâmicas, que o bot substituirá pelo dado real no momento do envio:

-   `{{title}}`: o título do artigo ou do vídeo.
-   `{{feedName}}`: o nome que deu à fonte no Feed Manager (por exemplo *Revista de Imprensa*).
-   `{{link}}`: o endereço do artigo.
-   `{{summary}}`: uma breve pré-visualização do texto (300 caracteres no máximo).

*Texto limpo.* Não se preocupe com o que chega dos feeds: o Titan limpa o texto das etiquetas HTML da fonte (imagens, tabelas, parágrafos) e neutraliza os caracteres especiais antes do envio, de modo que um artigo «sujo» não pode fazer falhar a mensagem.

Duas ferramentas ajudam-no a não errar:

-   **Pré-visualização.** O botão em forma de olho mostra como ficará a mensagem, com dados de exemplo no lugar das variáveis, sem sair do editor.
-   **Validador.** Enquanto escreve, o Titan assinala os problemas em tempo real: etiquetas não equilibradas, variáveis inexistentes, ligações não seguras. A margem da área fica vermelha para os erros, amarela para os avisos.

*Ligações limpas.* O Telegram sabe esconder as ligações longas dentro do texto. Em vez de «Clique aqui: {{link}}», escreva `<a href="{{link}}">Ler o artigo</a>`: o utilizador verá apenas a frase azul clicável.

### 6.4 A Zona de Perigo: reiniciar o histórico
No fundo do separador **Geral** há uma secção vermelha, a *Zona de Perigo*. O botão **Limpar Histórico** é potente e destrutivo: apaga a memória do bot, ou seja, tudo o que já publicou.

-   *Quando serve.* Se apagou por engano muitas mensagens do canal e quer que o bot volte a publicar as últimas notícias para reconstruir o mural.
-   *Como usá-lo sem desastres.* Se limpar o histórico e premir o Play, o bot considera «novo» tudo o que encontra nos feeds e envia-o em bloco, inundando o canal. Para o evitar, depois de limpar, reponha a **Data de Corte** (no mesmo separador) na data de hoje: assim o bot esquece o passado mas publica apenas de hoje em diante.

Ao limpar o histórico, os contadores das estatísticas também voltam a zero (Capítulo 3). Junto à Zona de Perigo encontra também a exportação do bot em formato `.rtb`, que vemos no Capítulo 7.

---
