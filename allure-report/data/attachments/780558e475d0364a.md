# Page snapshot

```yaml
- generic [ref=e5]:
  - img [ref=e6]
  - heading "Login" [level=1] [ref=e7]
  - alert [ref=e8]:
    - button "Close" [ref=e9] [cursor=pointer]: ×
    - text: Email e/ou senha inválidos
  - textbox "Digite seu email" [ref=e11]: ezequiel.dooley@teste.com
  - textbox "Digite sua senha" [ref=e13]: Senha@123
  - button "Entrar" [active] [ref=e14] [cursor=pointer]
  - generic [ref=e15]:
    - text: Não é cadastrado?
    - generic [ref=e16] [cursor=pointer]: Cadastre-se
```