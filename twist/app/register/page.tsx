"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import "../globals.css";
import styles from "./register.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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

    const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;
    const userData = { firstName, lastName, email, password, birthDate };
    console.log("📢 Données envoyées :", userData); // Log des données avant envoi

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage("Compte créé avec succès ! Redirection en cours...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error: any) {
      setMessage(error.message);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <img src="/twist-logo.png" alt="Twist Logo" className={styles.logo} />
        <h1 className={styles.tagline}>Connecte-toi, partage et inspire.</h1>
        <p className={styles.description}>
          Rejoins la communauté Twist et découvre un monde où chaque twist compte.
        </p>
      </div>

      <div className={styles.rightSection}>
        <h2 className={styles.title}>Créer un compte</h2>
        <p className={styles.subtitle}>
          Déjà un compte ? <a href="/login">Connecte-toi</a>
        </p>
        <form onSubmit={handleRegister} className={styles.form}>
  <div className={styles.flexRow}>
    <input type="text" placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={styles.input} />
    <input type="text" placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={styles.input} />
  </div>

  <label className={styles.label}>Date de naissance</label>
  <div className={styles.birthDateContainer}>
    <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} required className={styles.birthInput}>
      <option value="">Mois</option>
      {[...Array(12)].map((_, i) => (
        <option key={i} value={String(i + 1).padStart(2, "0")}>{i + 1}</option>
      ))}
    </select>
    <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} required className={styles.birthInput}>
      <option value="">Jour</option>
      {[...Array(31)].map((_, i) => (
        <option key={i} value={i + 1}>{i + 1}</option>
      ))}
    </select>
    <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)} required className={styles.birthInput}>
      <option value="">Année</option>
      {[...Array(100)].map((_, i) => (
        <option key={i} value={2024 - i}>{2024 - i}</option>
      ))}
    </select>
  </div>

  <div className={styles.emailPasswordContainer}>
    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.input} />
    <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required className={styles.input} />
    <input type="password" placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={styles.input} />
  </div>

  <div className={styles.checkboxGroup}>
    <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className={styles.checkbox} />
    <label>J’accepte les <a href="#" style={{ color: "#0790d5", textDecoration: "none" }}>termes & conditions</a></label>
  </div>

  <button type="submit" className={styles.button}>Créer un compte</button>
</form>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
}
