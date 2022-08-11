const mysql = require("mysql");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Qq98933096@",
  database: "dev",
});

module.exports = db;
