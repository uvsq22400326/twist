"use client";
//"use server";

import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

import { useState, FormEvent } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await loginUser(email, password);
    setMessage(res.message);
  }

  return (
    <div style={styles.container}>
      <h1>Connexion</h1>
      <form onSubmit={handleLogin} style={styles.form}>
        <label>Email :</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />

        <label>Mot de passe :</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />

        <button type="submit" style={styles.button}>Se connecter</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

// ✅ Server Action pour la connexion
async function loginUser(email: string, password: string) {
  //"use server";

  //import mysql from "mysql2/promise";
  //import bcrypt from "bcrypt";

  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [users]: any = await connection.execute("SELECT * FROM users WHERE email = ?", [email]);
    await connection.end();

    if (users.length === 0) {
      return { message: "Utilisateur non trouvé" };
    }

    const user = users[0];
    if (password !=user.password) {
      return { message: "Mot de passe incorrect" };
    }

    return { message: "Connexion réussie !" };
  } catch (error) {
    return { message: "Erreur lors de la connexion"+error };
  }
}

// ✅ Styles
const styles = {
  container: { maxWidth: "400px", margin: "50px auto", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "8px", fontSize: "16px", width: "100%" },
  button: { padding: "10px", background: "#0070f3", color: "white", border: "none", cursor: "pointer" },
};
