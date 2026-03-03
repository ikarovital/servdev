# language: pt
Funcionalidade: Regressão - Produtos (Cadastro e Listagem)
  Como administrador logado
  Eu quero gerenciar produtos (cadastrar, listar, editar e excluir)
  Para manter o catálogo do e-commerce atualizado

  Cenário: Cadastrar produto com sucesso e permanecer na listagem
    Dado que estou logado na área administrativa
    E estou na listagem de produtos
    Quando acesso a tela de cadastro de produto
    E preencho nome, preço, descrição e quantidade válidos
    E anexo uma imagem válida quando disponível
    E submeto o cadastro do produto
    Então permaneço na listagem de produtos
    E o produto cadastrado é exibido na lista

  Cenário: Validação de campos obrigatórios no cadastro de produto
    Dado que estou logado na área administrativa
    E estou na listagem de produtos
    Quando acesso a tela de cadastro de produto
    E submeto o formulário sem preencher os campos obrigatórios
    Então permaneço na tela de cadastro
    E o formulário exibe validação de campos obrigatórios

  Cenário: Validar preço negativo e não cadastrar
    Dado que estou logado na área administrativa
    E estou na listagem de produtos
    Quando acesso a tela de cadastro de produto
    E preencho o preço com valor negativo "-100"
    E submeto o cadastro do produto
    Então permaneço na tela de cadastro
    E o produto não é cadastrado

  Cenário: Validar quantidade zero e não cadastrar
    Dado que estou logado na área administrativa
    E estou na listagem de produtos
    Quando acesso a tela de cadastro de produto
    E preencho a quantidade com "0"
    E submeto o cadastro do produto
    Então permaneço na tela de cadastro
    E o produto não é cadastrado

  Cenário: Rejeitar upload de arquivo que não é imagem válida
    Dado que estou logado na área administrativa
    E estou na listagem de produtos
    Quando acesso a tela de cadastro de produto
    E preencho os dados do produto
    E anexo um arquivo que não é imagem válida
    E submeto o cadastro do produto
    Então permaneço na tela de cadastro
    E o produto não é cadastrado

  Cenário: Exibir a área de listagem de produtos
    Dado que estou logado na área administrativa
    Quando acesso a listagem de produtos
    Então devo ver a listagem de produtos
    E o link de cadastrar produtos está visível

  Cenário: Abrir tela de cadastro ao clicar em Cadastrar produtos
    Dado que estou logado na área administrativa
    E estou na listagem de produtos
    Quando clico em Cadastrar produtos
    Então devo ver a tela de cadastro de produtos
    E o título "Cadastro de Produtos" está visível

  
  Cenário: Excluir produto pela listagem quando há produtos
    Dado que estou logado na área administrativa
    E estou na listagem de produtos
    E existe pelo menos um produto na lista
    Quando clico em Excluir no primeiro produto
    E confirmo a exclusão
    Então volto para a listagem de produtos
    E a exclusão foi realizada
