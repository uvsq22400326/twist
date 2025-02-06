"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Simule un enregistrement (à remplacer par une vraie API)
    alert("Compte créé avec succès !");
    router.push("/"); // Redirige vers la connexion
  };

  return (
    <div style={styles.container}>
      <h1>Créer un compte</h1>
      <form onSubmit={handleRegister} style={styles.form}>
        <label>Nom d'utilisateur :</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={styles.input}
        />

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

        <button type="submit" style={styles.button}>S'inscrire</button>
      </form>

      <p>
        Déjà un compte ?{" "}
        <a href="/" style={styles.link}>Connectez-vous ici</a>
      </p>
    </div>
  );
}

// Styles inline
const styles = {
  container: { maxWidth: "400px", margin: "50px auto", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "8px", fontSize: "16px", width: "100%" },
  button: { padding: "10px", background: "#28a745", color: "white", border: "none", cursor: "pointer" },
  link: { color: "#0070f3", textDecoration: "none", fontWeight: "bold" },
};
