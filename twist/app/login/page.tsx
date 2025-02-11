"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import "../globals.css";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem("token", data.token);
      setMessage("Connexion réussie ! Redirection en cours...");
      setTimeout(() => router.push("/home"), 2000);
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <img src="/twist-logo.png" alt="Twist Logo" className={styles.logo} />
        <h1 className={styles.tagline}>Reconnecte-toi et rejoins la conversation.</h1>
        <p className={styles.description}>Sur Twist, chaque message compte. Continue à partager ton monde !</p>
      </div>

      <div className={styles.rightSection}>
        <h2 className={styles.title}>Connexion</h2>
        <p className={styles.subtitle}>
          Pas encore inscrit ? <a href="/register" className={styles.link}>Crée un compte</a>
        </p>

        <form onSubmit={handleLogin} className={styles.form}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className={styles.input} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" required className={styles.input} />

          <button type="submit" className={styles.button}>Se connecter</button>
        </form>
        {message && <p className={styles.message}>{message}</p>}

        <p className={styles.orText}>Ou connecte-toi avec</p>
        <div className={styles.socialButtons}>
          <button className={styles.socialButton}>
            <img src="/google.svg" alt="Google" className={styles.icon} /> Google
          </button>
          <button className={styles.socialButton}>
            <img src="/apple.svg" alt="Apple" className={styles.icon} /> Apple
          </button>
        </div>
      </div>
    </div>
  );
}
