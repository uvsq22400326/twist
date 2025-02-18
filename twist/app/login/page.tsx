"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import "../grid.css";
import "./login.css";

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

      sessionStorage.setItem("token", data.token);
      setMessage("Connexion réussie ! Redirection en cours...");
      setTimeout(() => router.push("/home"), 2000);
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  return (
    <div className="row">
      {/* agauche avec logo */}
      <div className="col-6">
        <img src="/twist-logo.png" alt="Twist Logo" id="logo" />
        <h1 id="logo-h1">Reconnecte-toi et rejoins la conversation.</h1>
        <p id="logo-p">
          Sur Twist, chaque message compte. Continue à partager ton monde !
        </p>
      </div>

      {/* trucdroit vec formulaire */}
      <div className="col-6" id="login-info-container">
        <h2>Connexion</h2>
        <p>
          Pas encore inscrit ? <a href="/register">Crée un compte</a>
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <br></br>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            required
          />
          <br></br>
          <button type="submit" className="button">
            Se connecter
          </button>
          <br></br>
        </form>
        {message && <p className={styles.message}>{message}</p>}

        <p>Ou connecte-toi avec</p>
        <div>
          <button className="icon-button">
            <img src="/google.svg" alt="Google" className="icon" /> Google
          </button>
          <button className="icon-button">
            <img src="/apple.svg" alt="Apple" className="icon" /> Apple
          </button>
        </div>
      </div>
    </div>
  );
}
