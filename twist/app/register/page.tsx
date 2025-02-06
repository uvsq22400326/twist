"use client";

import { useState, FormEvent } from "react";
import { registerUser } from "./serverActions"; // ✅ Importation correcte maintenant

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await registerUser(username, email, password);
    setMessage(res.message);
  }

  return (
    <div style={styles.container}>
      <h1>Créer un compte</h1>
      <form onSubmit={handleRegister} style={styles.form}>
        <label>Nom d'utilisateur :</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={styles.input} />

        <label>Email :</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />

        <label>Mot de passe :</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />

        <button type="submit" style={styles.button}>S'inscrire</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

// ✅ Styles
const styles = {
  container: { maxWidth: "400px", margin: "50px auto", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "8px", fontSize: "16px", width: "100%" },
  button: { padding: "10px", background: "#28a745", color: "white", border: "none", cursor: "pointer" },
};
