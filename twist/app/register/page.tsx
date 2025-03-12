"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import "../grid.css";
import "./register.css";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!termsAccepted) {
      setMessage("Veuillez accepter les termes et conditions.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }
    if (parseInt(birthYear) > 2011) {
      setMessage("Vous êtes trop jeune pour vous inscrire.");
      return;
    }
    if (!username.trim()) {
      setMessage("Le nom d'utilisateur est obligatoire.");
      return;
    }

    const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;
    const userData = { firstName, lastName, username, email, password, birthDate };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage("Compte créé avec succès ! Redirection...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error: any) {
      setMessage(error.message);
    }
  }

  return (
    <div className="register-container">
      <div className="logo-container">
        <img src="/twist-logo.png" alt="Twist Logo" className="logo" />
        <h1 className="logo-h1">Connecte-toi, partage et inspire.</h1>
        <p className="logo-p">Rejoins la communauté Twist et découvre un monde où chaque twist compte.</p>
      </div>

      <div className="register-box">
        <h2>Créer un compte</h2>

        <form onSubmit={handleRegister}>
          <div className="name-container">
            <input type="text" placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            <input type="text" placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>

          <input type="text" placeholder="Nom d'utilisateur" value={username} onChange={(e) => setUsername(e.target.value)} required />

          <label>Date de naissance</label>
          <div className="birth-container">
            <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} required>
              <option value="">Mois</option>
              {[...Array(12)].map((_, i) => (
                <option key={i} value={String(i + 1).padStart(2, "0")}>{i + 1}</option>
              ))}
            </select>
            <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} required>
              <option value="">Jour</option>
              {[...Array(31)].map((_, i) => (
                <option key={i} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)} required>
              <option value="">Année</option>
              {[...Array(100)].map((_, i) => (
                <option key={i} value={2024 - i}>{2024 - i}</option>
              ))}
            </select>
          </div>

          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input type="password" placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

          <div className="terms-container">
            <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
            <label>J’accepte les <a href="#" className="register-link">termes & conditions</a></label>
          </div>

          <button type="submit" className="register-button">Créer un compte</button>
        </form>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
