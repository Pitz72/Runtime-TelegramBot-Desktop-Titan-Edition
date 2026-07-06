## Capítulo 2: Instalação e primeiro arranque

### 2.1 Requisitos de sistema
O Titan Edition é leve e funciona em Windows e Linux:

-   **Windows:** Windows 10 ou superior (64 bits).
-   **Linux:** Ubuntu 22.04+, Debian e derivadas através do pacote `.deb`; nas restantes distribuições utilize o formato `.AppImage`, autónomo e sem instalação.

*Nota Linux:* em algumas versões recentes do Ubuntu, o `.AppImage` precisa do pacote `libfuse2`; se não arrancar, instale-o (`sudo apt install libfuse2`) ou utilize o `.deb`.

*Nota para servidores VPS:* o Titan também pode ser executado num Virtual Private Server sem placa gráfica dedicada. Se, ao arrancar, a interface não aparecer, um mecanismo de segurança força-a ao fim de uma dezena de segundos (falamos disso no Capítulo 9).

### 2.2 Instalação
A instalação é simples.

1. Transfira o ficheiro fornecido pelo seu administrador ou a partir da página oficial das versões.
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

---
