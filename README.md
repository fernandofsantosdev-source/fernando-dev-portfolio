# Portfólio — Fernando Santos

Portfólio pessoal feito com HTML, CSS e JavaScript. A experiência usa seções
verticais em tela cheia, rolagem natural e uma identidade visual preta e laranja
para apresentar projetos, trajetória, tecnologias e formação, vídeo, certificados
e contato.

## Como visualizar

Abra `index.html` em um navegador. A página tem seis seções — Início, Projetos,
Trajetória, Tecnologias & Formação, Sobre mim e Contato — adaptadas para
celulares, tablets e desktops. A rolagem é vertical e natural; as animações
respeitam a preferência do sistema por movimento reduzido.

Para a descoberta automática de certificados funcionar durante o desenvolvimento,
abra a pasta do projeto no VS Code e inicie o Live Server. A página consulta a
pasta `certificados/` e atualiza os PDFs encontrados sem recarregar. Ao abrir o
HTML diretamente como `file://`, o navegador bloqueia a leitura automática da
pasta; nesse caso, atualize o catálogo estático antes de publicar.

A seção Sobre exibe um espaço reservado para o vídeo até que uma mídia seja
configurada em `portfolioConfig.presentation`, no início de `script.js`. Para
usar uma foto, informe também um texto alternativo.

Para publicar, envie o conteúdo do repositório ao GitHub e ative o GitHub Pages
nas configurações do repositório, selecionando a branch e a pasta raiz.

## Personalização

- Edite os textos e habilidades em `index.html`. Os cards de projetos são
  gerados a partir dos PDFs em `projetos/` e dos metadados em
  `scripts/watch-projects.mjs`; projetos planejados sem apresentação também
  podem ser cadastrados nesse script.
- Ajuste cores, layout e animações em `styles.css`.
- As interações ficam em `script.js`.
- O botão de currículo baixa o PDF em `curriculo/`. Para trocar o arquivo,
  atualize `portfolioConfig.resumeUrl` no início de `script.js` e o nome no
  atributo `download` do link em `index.html`. Configure e-mail, LinkedIn e
  mídia da apresentação no mesmo objeto `portfolioConfig`.
- Para adicionar um projeto com apresentação, copie o PDF para `projetos/` e
  execute `node scripts/watch-projects.mjs --once` para atualizar
  `projetos/catalogo.js`. Cadastre título, descrição, status e tecnologias em
  `scripts/watch-projects.mjs`. Projetos planejados podem ser cadastrados sem
  PDF; nesse caso, o card não mostra o botão de apresentação.
- A seção Tecnologias & Formação tem abas para tecnologias, formação acadêmica e
  cursos/certificações. Os certificados encontrados na pasta `certificados/`
  usam os dados e logotipos informados no catálogo, sem atribuir instituição ou
  carga horária quando não disponíveis.
- Os logotipos locais do Curso em Vídeo e da Impacta ficam em
  `assets/curso-em-video-logo.png` e `assets/impacta-logo.png`; certificados sem
  instituição ou logotipo informado não recebem marcas presumidas.
- Para adicionar um certificado, copie o PDF para `certificados/`. Com o Live
  Server aberto, o site encontra o PDF em alguns segundos e atualiza a lista
  sozinho, sem tarefa de monitoramento do VS Code e sem atualizar o navegador.
- Os títulos novos são criados a partir do nome do arquivo. Use nomes claros,
  como `curso-de-python.pdf`. As habilidades continuam ligadas somente aos
  certificados correspondentes já identificados no portfólio.
- O catálogo publicado fica em `certificados/catalogo.js`. Para regenerá-lo
  antes de publicar, execute `node scripts/watch-certificates.mjs --once`.
  Não edite esse arquivo manualmente.
- Os cards de projeto oferecem apresentação quando há PDF e um botão de
  contato que leva à seção de contato. Quando configurado, o link do GitHub
  aparece somente na janela de apresentação do projeto.
