# language: pt
# Cobertura BDD equivalente a tests/e2e/Login.spec.js (Regressão - Autenticação - Login e Logout)
# Todos os cenários utilizam LoginPage e geram screenshot + Allure por step.

Funcionalidade: Regressão - Autenticação - Login e Logout
  Como usuário do sistema
  Eu quero fazer login e logout
  Para acessar a área administrativa de forma segura

  Cenário: Criar usuário com sucesso
    Dado que estou na página de login
    Quando acesso o formulário de cadastro de usuário
    E preencho nome, e-mail e senha válidos
    E aceito os termos
    E submeto o cadastro
    Então as credenciais são salvas para uso posterior
    E sou redirecionado com sucesso

  Cenário: Deve fazer login com usuário salvo
    Dado que estou na página de login
    Quando faço login com o usuário salvo
    Então devo ver a mensagem de boas-vindas do admin
    E estou na área administrativa

  Cenário: Deve exibir mensagem de erro para credenciais inválidas
    Dado que estou na página de login
    Quando faço login com o e-mail "invalido@example.com" e senha "senhaerrada"
    Então devo ver a mensagem "Email e/ou senha inválidos"

  Cenário: Deve validar campos obrigatórios (e-mail e senha vazios)
    Dado que estou na página de login
    Quando submeto o formulário sem preencher e-mail e senha
    Então devo ver a mensagem "Email é obrigatório"
    E devo ver a mensagem "Password é obrigatório"

  Cenário: Deve impedir login com e-mail em formato inválido
    Dado que estou na página de login
    Quando preencho o e-mail com "email-invalido" e a senha com "qualquercoisa"
    E submeto o formulário de login
    Então permaneço na página de login
    E não sou autenticado

  Cenário: Deve permitir logout e bloquear acesso posterior a rotas protegidas
    Dado que estou na página de login
    E faço login com o usuário salvo
    E estou na área administrativa
    Quando faço logout
    E navego para a rota "/usuarios"
    Então não devo ver o botão de cadastrar usuários
    E o acesso à área restrita está bloqueado
