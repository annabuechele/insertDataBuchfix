const mysql = require("mysql");

const conn_sql = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

conn_sql.connect(function (err) {
  if (err) return console.log(err.message);
  console.log(`Connected to MySQL-Server`);
  console.log(`DB-Name: ${process.env.DB_NAME}`);
});

module.exports = conn_sql;
