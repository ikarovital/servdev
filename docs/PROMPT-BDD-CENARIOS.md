# Prompt para criação de cenários BDD

Use o texto abaixo como prompt ao gerar cenários BDD (Gherkin) para o projeto. Copie e adapte conforme a funcionalidade.

---

## Prompt principal (copie e use)

```
Atue como analista de testes. Crie cenários BDD em Gherkin (Given/When/Then) para a funcionalidade que eu descrever.

**Regras:**
- Escreva em português.
- Use as palavras-chave: Dado, Quando, E, Então (ou Dada/Quando/Então no feminino quando fizer sentido).
- Um cenário = um fluxo completo; evite cenários gigantes.
- Inclua cenários de sucesso, validação de campos obrigatórios, dados inválidos e regras de negócio quando aplicável.
- Considere pré-condições (ex.: usuário logado, produto já cadastrado).

**Contexto do sistema:**
- Aplicação: front Serverest (ecommerce/admin) – base URL: https://front.serverest.dev
- Fluxos existentes: Login/Logout, Cadastro de usuário, Cadastro/Edição/Exclusão de produtos, Listagem.
- Autenticação: e-mail e senha; rotas protegidas exigem login.

**Formato de saída:**
Para cada cenário, entregue:
1. Nome do cenário (frase clara).
2. Steps em Gherkin (Dado/Quando/Então).
3. (Opcional) Critérios de aceite em uma linha.

**Funcionalidade a documentar em BDD:**
[DESCREVA AQUI A FUNCIONALIDADE OU MÓDULO]
```

---

## Exemplos de uso do prompt

### Exemplo 1 – Login

Substitua o último bloco por:

```
**Funcionalidade a documentar em BDD:**
Módulo de Login e Autenticação:
- Login com credenciais válidas (usuário já cadastrado).
- Login com e-mail e/ou senha inválidos.
- Validação de campos obrigatórios (e-mail e senha vazios).
- Validação de formato de e-mail inválido.
- Logout e bloqueio de acesso a rotas protegidas após logout.
```

### Exemplo 2 – Cadastro de usuário

```
**Funcionalidade a documentar em BDD:**
Cadastro de novo usuário na tela de login:
- Cadastro com sucesso (nome, e-mail, senha, checkbox).
- Validação de campos obrigatórios.
- Validação de formato de e-mail.
```

### Exemplo 3 – Produtos

```
**Funcionalidade a documentar em BDD:**
CRUD de Produtos (área admin, após login):
- Cadastro de produto (nome, preço, descrição, quantidade, imagem).
- Edição de produto existente.
- Exclusão de produto.
- Listagem de produtos.
- Validação de campos obrigatórios no cadastro/edição.
```

---

## Exemplo de cenários BDD (referência)

```gherkin
# language: pt
Funcionalidade: Login

  Cenário: Login com credenciais válidas
    Dado que estou na página de login
    E possuo um usuário cadastrado com e-mail "usuario@exemplo.com" e senha "senha123"
    Quando preencho o e-mail "usuario@exemplo.com"
    E preencho a senha "senha123"
    E clico em "Entrar"
    Então devo ver a mensagem "Este é seu sistema para administrar seu ecommerce."
    E devo estar na área administrativa

  Cenário: Login com credenciais inválidas
    Dado que estou na página de login
    Quando preencho o e-mail "invalido@example.com"
    E preencho a senha "senhaerrada"
    E clico em "Entrar"
    Então devo ver a mensagem "Email e/ou senha inválidos"

  Cenário: Validação de campos obrigatórios no login
    Dado que estou na página de login
    Quando clico em "Entrar" sem preencher e-mail e senha
    Então devo ver "Email é obrigatório"
    E devo ver "Password é obrigatório"
```

---

## Checklist antes de finalizar os cenários

- [ ] Cenários em português e no formato Gherkin.
- [ ] Pré-condições (Dado) deixam claro o estado inicial.
- [ ] Ações (Quando) descrevem o que o usuário faz.
- [ ] Resultados (Então) são verificáveis e específicos.
- [ ] Incluídos cenários de sucesso e de erro/validação.
- [ ] Nomes dos cenários são autoexplicativos.

---

*Documento criado para apoio à análise de testes e geração de BDD no projeto de automação (Playwright).*
