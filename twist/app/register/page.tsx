"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import "../grid.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showTermsModal, setShowTermsModal] = useState(false);


  function checkPasswordStrength(password: string) {
    const errors: string[] = [];
    if (password.length < 8) errors.push("Au moins 8 caractères.");
    if (!/[A-Z]/.test(password)) errors.push("Une majuscule requise.");
    if (!/[a-z]/.test(password)) errors.push("Une minuscule requise.");
    if (!/[0-9]/.test(password)) errors.push("Un chiffre requis.");
    if (!/[!@#$%^&*(),.?":{}|<>_-]/.test(password)) errors.push("Un caractère spécial requis.");
    
    setPasswordErrors(errors);
  }

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
    if (passwordErrors.length > 0) {
      setMessage("Le mot de passe n'est pas assez sécurisé.");
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

          <div className="password-container">
          <input
  type={showPassword ? "text" : "password"}
  placeholder="Mot de passe"
  value={password}
  onChange={(e) => { setPassword(e.target.value); checkPasswordStrength(e.target.value); }}
  required
  autoComplete="new-password" 
  style={{ WebkitTextSecurity: "disc" } as any} 
/>

            <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          
          {passwordErrors.length > 0 && (
            <ul className="password-errors">
              {passwordErrors.map((error, i) => <li key={i}>{error}</li>)}
            </ul>
          )}

          {/* Champ confirmation mot de passe */}
          <div className="password-container">
          <input
  type={showConfirmPassword ? "text" : "password"}
  placeholder="Confirmer le mot de passe"
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
  required
  autoComplete="new-password"
  style={{ WebkitTextSecurity: "disc" } as any}
/>

            <span className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="terms-container">
  <input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
  <label htmlFor="terms">
    J’accepte les{" "}
    <a className="terms-link" onClick={() => setShowTermsModal(true)}>termes & conditions</a>
  </label>
</div>

{showTermsModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Conditions d'utilisation</h2>
      <p>Bienvenue sur Twist ! Avant de créer un compte, veuillez lire et accepter nos conditions :</p>
      <ul>
        <li>Vous devez avoir au moins 13 ans pour utiliser Twist.</li>
        <li>Le contenu inapproprié, haineux ou illégal est interdit.</li>
        <li>Protégez vos informations personnelles et celles des autres.</li>
        <li>Twist se réserve le droit de suspendre ou supprimer tout compte en cas de violation.</li>
      </ul>
      <button className="close-modal" onClick={() => setShowTermsModal(false)}>Fermer</button>
    </div>
  </div>
)}

          <button type="submit" className="register-button">Créer un compte</button>
        </form>

        {/* Lien vers le login */}
        <p className="already-account">Déjà un compte ? <a href="/login">Connecte-toi</a></p>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
