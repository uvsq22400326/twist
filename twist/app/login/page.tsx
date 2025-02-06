"use client"; 

import React, { useState, FormEvent } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Login Attempt:", { email, password });
  };

  return (
    <div style={styles.container}>
      <h1>Connexion</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label>Email :</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <label>Mot de passe :</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>Se connecter</button>
      </form>
    </div>
  );
}

// Styles inline pour éviter un fichier CSS séparé
const styles = {
  container: { maxWidth: "400px", margin: "0 auto", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "8px", fontSize: "16px" },
  button: { padding: "10px", background: "#0070f3", color: "white", border: "none", cursor: "pointer" },
};
