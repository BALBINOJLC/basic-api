module.exports = {
  '*.ts': ['prettier --write', 'eslint --fix'],
  '*.json': ['prettier --write'],
  ignorePatterns: ['src/templates/**'],

};
