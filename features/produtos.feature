# language: pt
Funcionalidade: Cadastro e listagem de produtos
  Como usuário administrador autenticado
  Quero cadastrar e listar produtos
  Para gerenciar o catálogo do ecommerce

  Cenário: Cadastro de produto com sucesso
    Dado que estou autenticado no sistema
    E estou na área administrativa
    Quando acesso "Cadastrar produtos"
    E preencho o nome com "TV 50 polegadas"
    E preencho o preço com "1999"
    E preencho a descrição com "Smart TV Full HD"
    E preencho a quantidade com "10"
    E anexo uma imagem válida
    E clico em "Cadastrar" no formulário de produtos
    Então devo ver a mensagem ou feedback de sucesso no cadastro
    E o produto deve aparecer na lista de produtos

  Cenário: Cadastro de produto com campos obrigatórios não preenchidos
    Dado que estou autenticado no sistema
    E estou na área administrativa
    Quando acesso "Cadastrar produtos"
    E deixo os campos nome, preço, descrição e quantidade vazios
    E clico em "Cadastrar" no formulário de produtos
    Então devo permanecer na tela "Cadastro de Produtos"
    E devo ver mensagem de validação indicando campos obrigatórios

  Cenário: Cadastro de produto com preço negativo
    Dado que estou autenticado no sistema
    E estou na tela "Cadastro de Produtos"
    Quando preencho o nome com "Produto teste"
    E preencho o preço com "-100"
    E preencho a descrição com "Descrição válida"
    E preencho a quantidade com "5"
    E clico em "Cadastrar" no formulário de produtos
    Então devo ver mensagem de erro ou validação para preço inválido
    E o produto não deve ser cadastrado

  Cenário: Cadastro de produto com quantidade inválida (zero ou negativa)
    Dado que estou autenticado no sistema
    E estou na tela "Cadastro de Produtos"
    Quando preencho o nome com "Produto teste"
    E preencho o preço com "50"
    E preencho a descrição com "Descrição válida"
    E preencho a quantidade com "0"
    E clico em "Cadastrar" no formulário de produtos
    Então devo ver mensagem de erro ou validação para quantidade inválida
    E o produto não deve ser cadastrado

  Cenário: Cadastro de produto com nome já existente
    Dado que estou autenticado no sistema
    E já existe um produto cadastrado com o nome "TV 50 polegadas"
    Quando acesso "Cadastrar produtos"
    E preencho o nome com "TV 50 polegadas"
    E preencho o preço com "1999"
    E preencho a descrição com "Descrição"
    E preencho a quantidade com "1"
    E clico em "Cadastrar" no formulário de produtos
    Então devo ver mensagem indicando que já existe produto com esse nome
    E devo permanecer na tela "Cadastro de Produtos"

  Cenário: Cadastro de produto com upload de imagem inválida
    Dado que estou autenticado no sistema
    E estou na tela "Cadastro de Produtos"
    Quando preencho o nome com "Produto com imagem"
    E preencho o preço com "100"
    E preencho a descrição com "Descrição"
    E preencho a quantidade com "1"
    E anexo um arquivo que não é imagem válida
    E clico em "Cadastrar" no formulário de produtos
    Então devo ver mensagem de erro relacionada ao formato ou arquivo da imagem
    E o produto não deve ser cadastrado

  Cenário: Produto aparece na lista após cadastro
    Dado que estou autenticado no sistema
    E estou na "Lista dos Produtos"
    Quando cadastro um novo produto com nome "Notebook XYZ"
    E retorno para a listagem de produtos
    Então devo ver o heading "Lista dos Produtos"
    E o produto "Notebook XYZ" deve estar visível na tabela ou lista

  Cenário: Busca de produto por nome na listagem
    Dado que estou autenticado no sistema
    E existem produtos cadastrados na lista
    E estou na tela "Lista dos Produtos"
    Quando busco ou filtro pelo nome "TV 50"
    Então devo ver na lista apenas o produto ou produtos cujo nome contém "TV 50"

  Cenário: Lista de produtos vazia
    Dado que estou autenticado no sistema
    E não existem produtos cadastrados
    Quando acesso a listagem de produtos
    Então devo ver o heading "Lista dos Produtos"
    E devo ver indicação de lista vazia ou nenhum produto

  Cenário: Exclusão de produto pela listagem
    Dado que estou autenticado no sistema
    E estou na tela "Lista dos Produtos"
    E existe pelo menos um produto na lista
    Quando clico em "Excluir" no produto desejado
    E confirmo a exclusão quando solicitado
    Então o produto não deve mais aparecer na lista
    E devo permanecer na "Lista dos Produtos"

  Cenário: Redirecionamento para edição pela listagem
    Dado que estou autenticado no sistema
    E estou na tela "Lista dos Produtos"
    E existe pelo menos um produto na lista
    Quando clico em "Editar" no produto desejado
    Então devo ser redirecionado para a tela de edição do produto
    E devo ver os dados do produto preenchidos para edição
