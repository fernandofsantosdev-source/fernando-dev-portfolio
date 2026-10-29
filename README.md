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

A seção Sobre permite escolher um vídeo local para pré-visualização na sessão.
Para exibir um vídeo publicado, adicione o arquivo ao projeto e configure a fonte
do player em `index.html`.

Para publicar, envie o conteúdo do repositório ao GitHub e ative o GitHub Pages
nas configurações do repositório, selecionando a branch e a pasta raiz.

## Personalização

- Edite os textos, habilidades e projetos em `index.html`.
- Ajuste cores, layout e animações em `styles.css`.
- As interações ficam em `script.js`.
- A seção Tecnologias & Formação usa abas para alternar entre as tecnologias
  organizadas por categoria e os certificados encontrados na pasta
  `certificados/`. Os certificados usam os dados e logotipos informados no
  catálogo, sem atribuir instituição ou carga horária quando não disponíveis.
- O logotipo local do Curso em Vídeo fica em `assets/curso-em-video-logo.png`;
  os demais certificados não recebem uma instituição ou logotipo não informado.
- Para adicionar um certificado, copie o PDF para `certificados/`. Com o Live
  Server aberto, o site encontra o PDF em alguns segundos e atualiza a lista
  sozinho, sem tarefa de monitoramento do VS Code e sem atualizar o navegador.
- Os títulos novos são criados a partir do nome do arquivo. Use nomes claros,
  como `curso-de-python.pdf`. As habilidades continuam ligadas somente aos
  certificados correspondentes já identificados no portfólio.
- O catálogo publicado fica em `certificados/catalogo.js`. Para regenerá-lo
  antes de publicar, execute `node scripts/watch-certificates.mjs --once`.
  Não edite esse arquivo manualmente.
- Ainda não há currículo em PDF, e-mail ou LinkedIn configurados; adicione os
  dados reais antes de incluir esses links no site.
- A seção de projetos apresenta o Sistema de Testes Web, o Assistente Financeiro
  Local e o Dashboard de Vendas. Os botões levam ao perfil GitHub e à seção de
  contato; substitua-os por links diretos de repositórios/demonstrações quando
  essas URLs estiverem disponíveis.
