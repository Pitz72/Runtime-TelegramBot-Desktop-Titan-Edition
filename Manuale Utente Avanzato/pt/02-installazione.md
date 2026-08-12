## Capítulo 2: Instalação e primeiro arranque

### 2.1 Requisitos de sistema
O Titan Edition é leve e funciona em Windows e Linux:

-   **Windows:** Windows 10 ou superior (64 bits).
-   **Linux:** Ubuntu 22.04+, Debian e derivadas através do pacote `.deb`; nas restantes distribuições utilize o formato `.AppImage`, autónomo e sem instalação.

*Nota Linux:* em algumas versões recentes do Ubuntu, o `.AppImage` precisa do pacote `libfuse2`; se não arrancar, instale-o (`sudo apt install libfuse2`) ou utilize o `.deb`.

*Nota para servidores VPS:* o Titan também pode ser executado num Virtual Private Server sem placa gráfica dedicada. Se, ao arrancar, a interface não aparecer, um mecanismo de segurança força-a ao fim de uma dezena de segundos (falamos disso no Capítulo 9).

### 2.2 Instalação
A instalação é simples.

1. Transfira o instalador a partir da página das versões do projeto. Em alternativa pode compilá-lo a partir do código-fonte.
2. **No Windows:** execute o ficheiro `.exe` e siga as instruções no ecrã. O programa cria por si só um atalho no ambiente de trabalho.
3. **No Linux:** com o pacote `.deb`, faça duplo clique e deixe o gestor de pacotes tratar do assunto; com o `.AppImage`, torne o ficheiro executável (clique com o botão direito → Propriedades → Permissões → Permitir a execução) e abra-o com um duplo clique.

Depois de instalado, não terá de transferir mais nada à mão: o Titan verifica por si mesmo se existe uma versão mais recente e, quando a encontra, avisa-o com um ecrã dedicado que lhe pergunta se deve transferi-la e, terminada a transferência, se deve reiniciar para a instalar.

![O aviso de atualização disponível: o Titan pede confirmação antes de transferir e antes de reiniciar.](screenshots/11-update-available.png)

### 2.3 O Setup Wizard (primeiro arranque)
No primeiro arranque, após a sequência animada de arranque e a escolha do idioma, o Titan recebe-o com um assistente de configuração (Setup Wizard) em quatro passos, para deixar logo pronta a sua primeira automação.

![O assistente de configuração orienta a preparação do primeiro bot em quatro passos.](screenshots/02-setup-wizard.png)

1.  **Nome do Bot:** um nome descritivo que o ajude a reconhecer o perfil dentro da interface (p. ex. «Bot Notícias Desporto»). Não será visível para os seus utilizadores no Telegram.
2.  **Token do Bot:** cole aqui o token secreto gerado pelo `@BotFather`. *(Como obtê-lo é explicado no Capítulo 4.2.)*
3.  **ID do Canal (Channel ID):** o nome de utilizador público do canal precedido pela arroba (p. ex. `@omeucanal`). Se o canal for privado, introduza o seu identificador numérico, que costuma começar pelo sinal menos (p. ex. `-100123456789`).
4.  **Data de Início (Start Date):** um parâmetro importante. Por predefinição é a data de hoje: o Titan lerá à mesma os seus feeds, mas **ignorará e descartará** qualquer notícia ou vídeo publicado antes desta data. Serve para evitar que, no primeiro arranque, o bot inunde o canal com notícias de há semanas.

Concluídos os quatro passos, clique em **Iniciar Titan**: irá encontrar-se no painel de comando principal.

### 2.4 O ecrã de boas-vindas: idioma, guia e manual
O ecrã das oito bandeiras não é apenas do primeiro arranque: volta em cada arranque, e é aí que escolhe o idioma da interface, que muda de imediato. O botão **Iniciar Titan** leva-o para dentro.

Por baixo desse botão há três atalhos:

-   **Guia Rápido** abre no ecrã um resumo de poucas páginas, no idioma escolhido: como obter o token junto do @BotFather, os quatro passos do assistente, como adicionar uma fonte, como personalizar as mensagens e como ligar o motor. Destina-se a quem quer começar de imediato, sem ler este manual.
-   **Descarregar Manual (PDF)** abre no navegador do sistema o manual completo — aquele que está a ler — no seu idioma. O ficheiro não está dentro da aplicação: é obtido da rede nesse momento, pelo que é necessária uma ligação ativa.
-   **Apoiar o projeto** abre a página para um donativo livre. O Titan é gratuito e de código aberto: o donativo é facultativo e não desbloqueia nada.

As duas entradas de documentação encontra-as também nas Definições de Sistema, no separador **Geral** (Capítulo 8.2).

### 2.5 Depois de uma atualização: o ecrã «Novidades»
Quando o Titan se atualizou, o primeiro arranque da nova versão mostra um ecrã inteiro que enumera o que mudou: correções, funções novas, comportamentos alterados. O número de versão está em destaque, a lista está no seu idioma, e o botão **Continuar** fecha-a.

Aparece uma só vez por versão: fechada essa, não a volta a ver até chegar a atualização seguinte. Se uma versão não trouxer uma lista própria, no seu lugar surge uma linha genérica que assinala correções e melhorias de estabilidade.


---
