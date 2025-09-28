import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",           // o el usuario que uses en MySQL
  password: "COTe07*", // tu contraseña de MySQL
  database: "PinesDB"
});

export default db;
