"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Simule une authentification (remplacer par une vraie API)
    if (email === "user@example.com" && password === "password123") {
      alert("Connexion réussie !");
      router.push("/dashboard"); // Redirige après connexion (ex: /dashboard)
    } else {
      alert("Email ou mot de passe incorrect !");
    }
  };

  return (
    <div style={styles.container}>
      <h1>Bienvenue sur Twist</h1>
      <p>Veuillez vous identifier</p>
      
      <form onSubmit={handleLogin} style={styles.form}>
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

      <p>
        Pas encore de compte ?{" "}
        <a href="/register" style={styles.link}>Inscrivez-vous ici</a>
      </p>
    </div>
  );
}


const styles = {
  container: { maxWidth: "400px", margin: "50px auto", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "8px", fontSize: "16px", width: "100%" },
  button: { padding: "10px", background: "#0070f3", color: "white", border: "none", cursor: "pointer" },
  link: { color: "#0070f3", textDecoration: "none", fontWeight: "bold" },
};
