export function generateUser() {
    const random = Math.floor(Math.random() * 100000);
  
    return {
      nome: `Usuario ${random}`,
      email: `usuario${random}@teste.com`,
      password: `Senha${random}`
    };
  }