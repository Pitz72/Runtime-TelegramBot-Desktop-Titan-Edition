## Capítulo 9: Resolução de problemas

Aqui encontra os problemas mais comuns e como sair deles, no formato problema e solução.

**A janela está em branco no arranque.** Acontece raramente, e quase só em máquinas virtuais ou computadores sem placa gráfica atualizada. Espere uma dezena de segundos: o Titan tem um paraquedas que, se a interface não aparecer por si só, a força de qualquer maneira. Se ficar em branco, reinstale a aplicação por cima da antiga: não perde qualquer dado, porque a base de dados é guardada numa pasta do sistema separada do programa (o caminho exato está no Capítulo 7).

**Adicionei um feed do YouTube e nos registos leio «Cannot read properties…».** A ligação entre o Titan e o YouTube (*InnerTube*) não é oficial: lê as páginas como o faria um navegador. De vez em quando o Google muda o código das suas páginas e desnorteia esta leitura. O erro aparece no registo e o painel de comando assinala-o com uma notificação. Entretanto, desative o canal do YouTube em causa e aguarde uma atualização: o Titan atualiza-se sozinho (Capítulo 2) e o problema costuma resolver-se pela raiz. As suas Notícias e os seus Podcasts, entretanto, continuam a funcionar sem problemas.

**O bot assinala «Bad Request: chat not found».** O Channel ID está errado ou, mais frequentemente, esqueceu-se de adicionar o bot aos **Administradores** do canal. Resolva: abra-o nas definições do canal do Telegram, adicione o bot como administrador e dê-lhe permissão para enviar mensagens. O erro desaparece (veja também o Capítulo 4).

**O bot publica as notícias mas a imagem aparece como um quadradinho pequeno em vez de uma pré-visualização grande.** É o comportamento normal do Telegram quando a fonte RSS não contém uma imagem grande, mas apenas uma miniatura. O Titan procura a imagem na resolução mais alta que consegue encontrar, chegando a escavar no texto do artigo, mas se a fonte não tiver uma adequada, o Telegram recorre à miniatura. Para o corrigir é preciso intervir no site que publica o feed, não no bot.

---
