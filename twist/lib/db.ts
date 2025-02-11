import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST as string,
  user: process.env.MYSQL_USER as string,
  password: process.env.MYSQL_PASSWORD as string,
  database: process.env.MYSQL_DATABASE as string,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
