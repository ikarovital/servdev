import { faker } from '@faker-js/faker';

/** Senha fixa e previsível para reutilização nos testes de login */
const FIXED_PASSWORD = 'Senha@123';

/**
 * Normaliza string para uso em e-mail: minúsculo, sem acentos, apenas letras.
 * @param {string} str
 * @returns {string}
 */
function slugForEmail(str) {
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

/**
 * Gera um usuário com dados realistas e reutilizáveis.
 * - Nome padronizado: "Nome Sobrenome" (mesmo nome e sobrenome usados no e-mail)
 * - E-mail padronizado: nome.sobrenome@teste.com (sem sufixo aleatório)
 * - Senha fixa para reutilização nos testes
 *
 * @returns {{ nome: string, email: string, password: string }}
 */
export function generateUser() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const nome = `${firstName} ${lastName}`;

  const slugFirst = slugForEmail(firstName) || 'user';
  const slugLast = slugForEmail(lastName) || 'test';
  const email = `${slugFirst}.${slugLast}@teste.com`;

  return {
    nome,
    email,
    password: FIXED_PASSWORD,
  };
}
