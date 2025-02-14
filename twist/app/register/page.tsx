"use client";

import 'purecss'
import { useState, FormEvent } from "react";

import { useRouter } from "next/navigation";
/*import "../globals.css";*/
import "../grid.css"
import "./register.css"
/*import "./register.module.css"; */

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


  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!termsAccepted) {
      alert("Veuillez accepter les termes et conditions.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    sessionStorage.setItem(
      "user",
      JSON.stringify({ firstName, lastName, birthMonth, birthDay, birthYear, email })
    );
    router.push("/home");
  };

  return (
    <div className='row'>
      {/* gauche (Logo + Texte) */}
      <div className='col-6'>
        <img src="/twist-logo.png" alt="Twist Logo" id='logo'/>
        <h1  id='logo-h1' >Connecte-toi, partage et inspire.</h1>
        <p  id='logo-p' >
          Rejoins la communauté Twist et découvre un monde où chaque twist compte.
        </p>
      </div>

      {/* droiteFormu*/}
      <div className='col-6' id='register-info-container'>
        <h2>Créer un compte</h2>
        <p>
          Déjà un compte ? <a href="/login">Connecte-toi</a>
        </p>

        <form onSubmit={handleRegister}>
          <div>
            <input type="text" placeholder="Nom" value={lastName}
             onChange={(e) => setLastName(e.target.value)} required
             className="name-input"/>
            <input type="text" placeholder="Prénom" value={firstName} 
            onChange={(e) => setFirstName(e.target.value)} required
            className="name-input"/>
          </div>


          {/*  Date de naissance */}
          <label>Date de naissance</label>
          <div>
            <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} 
            required className='birth-input'>
              <option value="">Mois</option>
              <option value="01">Janvier</option>
              <option value="02">Février</option>
              <option value="03">Mars</option>
              <option value="04">Avril</option>
              <option value="05">Mai</option>
              <option value="06">Juin</option>
              <option value="07">Juillet</option>
              <option value="08">Août</option>
              <option value="09">Septembre</option>
              <option value="10">Octobre</option>
              <option value="11">Novembre</option>
              <option value="12">Décembre</option>
            </select>
            <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)}
             required className='birth-input'>
              <option value="">Jour</option>
              {[...Array(31)].map((_, i) => (
                <option key={i} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)}
             required className='birth-input'>
              <option value="">Année</option>
              {[...Array(100)].map((_, i) => (
                <option key={i} value={2024 - i}>{2024 - i}</option>
              ))}
            </select>
          </div>


          <input type="email" placeholder="Email" value={email}
           onChange={(e) => setEmail(e.target.value)} 
           required className='auth-info-input'/>
          <br></br>
          <input type="password" placeholder="Mot de passe" value={password}
           onChange={(e) => setPassword(e.target.value)} 
           required className='auth-info-input'/>
          <br></br>
          <input type="password" placeholder="Confirmer le mot de passe" value={confirmPassword}
           onChange={(e) => setConfirmPassword(e.target.value)} 
           required className='auth-info-input'/>
          <br></br>
          <div>
            <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}/>
            <label>J’accepte les <a href="#" style={{ color: "#0790d5", textDecoration: "none" }}>termes & conditions</a></label>
          </div>

          <button type="submit" id='submit-button'>Créer un compte</button>
        </form>
      </div>
    </div>
  );
}

