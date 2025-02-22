"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "../grid.css";
import "./home.css";
import PostArea from "./postArea";

export default function HomePage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null); // Ajout pour l'upload d'image/vidéo
  const [errorPublier, setError] = useState("");
  const [_token, set_Token] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.log("Token manquant, redirection vers login");
      router.push("/login");
    }
    if (token != null) {
      set_Token(token);
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("token"); 
    router.push("/login");
  };

  // Fonction pour publier un tweet avec une image/vidéo
  const handlePostTweet = async () => {
    const token = sessionStorage.getItem("token");

    // Types de fichiers autorisés
const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "video/mp4", "video/webm", "video/ogg"];

if (!content && !file) {
  setError("Le contenu ou un fichier est requis !");
  return;
}

// Vérifier si un fichier est sélectionné et si son type est valide
if (file && !allowedTypes.includes(file.type)) {
  setError("Seuls les fichiers image (PNG, JPG, GIF, WEBP) et vidéo (MP4, WEBM, OGG) sont autorisés !");
  return;
}


    if (!token) {
      setError("Token manquant !");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("content", content);
      if (file) {
        formData.append("file", file);
      }

      const response = await fetch("/api/home/publier", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setError("");
        alert("Tweet publié avec succès !");
        setContent("");
        setFile(null); // Réinitialiser l'input fichier
      } else {
        setError(result.error || "Erreur lors de la publication du tweet");
      }
    } catch (error) {
      console.log(error);
      setError("Erreur serveur");
    }
  };

  return (
    <div>
      <aside className="col-3" id="nav-sidebar">
        <img src="/twist-logo.png" alt="Twist Logo" id="logo" />
        <nav>
          <a href="#" className="sidebar-item">Accueil</a><br />
          <a href="#" className="sidebar-item">Recherche</a><br />
          <a href="#" className="sidebar-item">Messages</a><br />
          <a href="#" className="sidebar-item">Notifications</a><br />
          <a href="/profil" className="sidebar-item">Profil</a><br />
        </nav>
      </aside>

      <button id="open-sidebar" onClick={() => displaySidebar()}>&#x27c1;</button>
      <br />
      <button onClick={handleLogout} id="logout-button">Déconnexion</button>

{/* Contenu principal */}
<main className="col-8" id="twist-area">
  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <textarea
      placeholder="Quoi de neuf ?"
      value={content}
      onChange={(e) => setContent(e.target.value)}
    />
    
    {/*  Ajout du champ pour uploader une image/vidéo */}
    <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />

    <button id="publier-button" onClick={handlePostTweet}>Publier</button>
  </div>
  
  <br />
  {errorPublier && <p style={{ color: "red" }}>{errorPublier}</p>}

  {PostArea(_token)}
</main>
</div>
);
}
