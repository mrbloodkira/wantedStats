const mysql = require('mysql2');

// Criar uma conexão com o banco de dados
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Usuário padrão do MySQL no XAMPP
  password: '', // Senha padrão (se você não configurar uma no phpMyAdmin)
  database: 'wantedStats'
});

// Conectar ao banco de dados
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.stack);
    return;
  }
  console.log('Conectado ao banco de dados MySQL com sucesso.');
});

module.exports = connection;