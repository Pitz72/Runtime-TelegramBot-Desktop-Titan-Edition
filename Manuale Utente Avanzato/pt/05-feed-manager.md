## Capítulo 5: O Feed Manager (as fontes)

### 5.1 Adicionar e testar uma fonte
O Feed Manager (o painel por baixo da lista de bots) é a «dieta» do seu bot: aqui introduz os endereços web (URL) de onde o Titan irá pescar os conteúdos.

Para adicionar uma fonte:

1. Selecione o bot ao qual a quer atribuir.
2. Clique em **Adicionar Fonte**.
3. Dê um **Nome** à fonte. Não é uma etiqueta qualquer: é o texto que poderá mostrar no cabeçalho das mensagens como assinatura da notícia (é o campo `{{feedName}}` dos modelos, Capítulo 6).
4. Escolha o **Tipo**:
    -   **Podcast:** para os fluxos de áudio (MP3). O Titan tenta recuperar a imagem de capa, muitas vezes escondida nas etiquetas *iTunes* usadas por serviços como o Spreaker ou o AzuraCast.
    -   **Notícias:** para os clássicos artigos de blogues, sites de informação ou jornais.
5. Cole o URL do feed (normalmente um endereço que termina em `.xml` ou `.rss`).

Antes de guardar pode usar o botão **Testar (⚡)**: faz uma chamada real à ligação e diz-lhe logo se responde. Se o feed for válido, um aviso verde indica quantas notícias encontrou; se algo não estiver bem (site em baixo, ligação errada), o aviso é vermelho. O teste é apenas uma verificação: não o obriga a nada, pode guardar à mesma, mas é a forma mais rápida de não introduzir um endereço errado.

![O formulário de introdução de uma nova fonte, com o nome, o tipo, o URL e o botão de teste.](screenshots/06-feed-form.png)

Cada fonte na lista tem um interruptor para a ativar ou colocar em pausa sem a apagar, e os ícones para a modificar ou eliminar.

![A lista de fontes: o tipo, o crachá dos filtros ativos e o interruptor de cada feed.](screenshots/13-feed-list.png)

Se uma fonte deixar de responder (por exemplo um erro 404), dá por isso: nos Registos do Sistema aparece uma linha vermelha com o nome do feed. E se está a perguntar-se quantas fontes pode adicionar, não há um limite fixo: tenha em conta, no entanto, que o motor as verifica à vez, pelo que com muitas dezenas de feeds (ou muitos bots) a volta completa de verificação se alonga.

### 5.2 A gestão nativa do YouTube
Normalmente, integrar o YouTube num sistema de automação é uma maçada: exige uma conta de programador no Google Cloud e uma chave API, com os respetivos custos e limites. O Titan poupa tudo isto graças ao *InnerTube*, um motor que lê as páginas do YouTube como o faria um navegador, sem qualquer chave.

1.  Em **Adicionar Fonte** escolha o tipo **YouTube (Vídeo)**.
2.  No campo URL não são precisos códigos estranhos nem feeds XML: cole o handle do canal (a arroba por baixo do nome do youtuber, por exemplo `@RuntimeRadio`) ou o endereço completo do canal copiado do navegador.

Do resto trata o Titan. Há, no entanto, uma precaução útil: o **filtro anti-premiere**. Quando um youtuber agenda um direto ou um vídeo «disponível dentro de dois dias», o YouTube mostra-o à mesma no topo da lista. Um bot ingénuo enviaria logo a notificação, e quem clica vai parar a um vídeo ainda não disponível. O Titan, por seu lado, verifica o estado do vídeo: se estiver marcado como *upcoming* ou *premiere*, descarta-o e só o publica quando fica realmente visível.

### 5.3 Opções avançadas do feed
Quando adiciona ou modifica uma fonte, por baixo dos campos principais há três regulações facultativas. Pode ignorá-las (o feed funciona muito bem com os valores predefinidos) ou usá-las para um controlo mais fino.

-   **Filtro por palavras-chave.** Dois campos, «incluir» e «excluir», com as palavras separadas por vírgulas. Se preencher «incluir», o Titan só publica os conteúdos onde aparece pelo menos uma dessas palavras, no título ou no texto; se preencher «excluir», descarta os que contêm ainda que uma só. Um crachá âmbar na fonte assinala que o filtro está ativo.
-   **Intervalo personalizado.** Por norma, cada feed segue o ritmo de verificação do bot. Aqui pode dar-lhe um próprio, de 5 minutos a 24 horas: cómodo para verificar mais vezes um site muito ativo, ou mais raramente um lento. Um crachá indica o intervalo definido.
-   **Digest.** Em vez de publicar cada conteúdo assim que sai, o Titan pode acumulá-los e enviá-los juntos numa única mensagem de resumo, a intervalos fixos (1 hora, 6, 12, 24 horas ou 7 dias). O resumo enumera os títulos com a ligação «Ler», até 20 conteúdos por mensagem. Útil para as fontes prolixas, que de outro modo inundariam o canal. Um crachá violeta assinala o digest ativo.

### 5.4 Importar vários feeds de uma vez (OPML)
Se já tem uma lista de feeds num leitor de RSS, não é preciso voltar a introduzi-los à mão. O botão **OPML**, no topo do Feed Manager, importa em bloco todas as fontes contidas num ficheiro `.opml` padrão, o formato com que os leitores de RSS exportam as suas listas. No final, o Titan diz-lhe quantos feeds adicionou.

---
