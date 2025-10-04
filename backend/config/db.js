import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "Admin",           // o el usuario Admin
  password: "123456",
  database: "PinesDB"
});

export default db;
