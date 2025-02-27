"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import "../grid.css";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [imageIndex, setImageIndex] = useState(0);

  const images = [
    "/images/photo1.jpg",
    "/images/photo2.jpg",
    "/images/photo3.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
      setMessage("Connexion réussie !");
      setTimeout(() => router.push("/home"), 2000);
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="phone-container">
        <img src="/phone-frame.png" alt="Phone" className="phone-frame" />
        <img src={images[imageIndex]} alt="Diaporama" className="phone-image" />
      </div>

      <div className="login-box">
        <img src="/twist-logo.png" alt="Twist Logo" className="logo" />
        <h1 className="logo-h1">Reconnecte-toi et rejoins la conversation.</h1>
        <p className="logo-p">
          Sur Twist, chaque message compte. Continue à partager ton monde !
        </p>

        <h2>Connexion</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            required
          />
          <button type="submit" className="button">
            Se connecter
          </button>
          <p>
            Pas encore inscrit ? <a href="/register" className="register-link">Crée un compte</a>
          </p>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
