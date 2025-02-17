import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "mysql-4e2f1e4-twist-f47b.g.aivencloud.com",
  user: "avnadmin",
  password: "AVNS_t0WuR86pvL03-hAAlBU",
  database: "defaultdb",
  port: 12289,
  ssl: {
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
