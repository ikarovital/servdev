import fs from 'fs';

export function saveUserCredentials(user) {
  const folderPath = './test-data';

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  fs.writeFileSync(
    `${folderPath}/createdUser.json`,
    JSON.stringify(user, null, 2)
  );
}

export function getSavedUser() {
  const filePath = './test-data/createdUser.json';

  if (!fs.existsSync(filePath)) {
    throw new Error('Arquivo de usuário não encontrado.');
  }

  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
}
