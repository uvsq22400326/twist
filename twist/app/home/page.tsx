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
  const [showMenu, setShowMenu] = useState(false);

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
        setFile(null); 
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

       <header>
       <div className="header-divider"></div> 

        <input type="text" placeholder="Rechercher..." />

<div className="user-menu">
    <span className="menu-icon" onClick={() => setShowMenu(!showMenu)}>⋮</span>
    {showMenu && (
        <div className="dropdown-menu">
            <button onClick={handleLogout}>Se déconnecter</button>
        </div>
    )}
</div>

      </header>

      <main id="twist-area">
<div className="tweet-box">
    <textarea
        placeholder="Quoi de neuf ?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
    />

    
<label className="icon-label">
    <img src="/icons/image.png" alt="Ajouter une image ou vidéo" />
    <span className="upload-text">Médias</span>
    <input 
        type="file" 
        className="hidden-input"
        accept="image/png, image/jpeg, image/gif, image/webp, video/mp4, video/webm, video/ogg"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
    />
</label>

    <button onClick={handlePostTweet}>Publier</button>
</div>

        {errorPublier && <p className="error-text">{errorPublier}</p>}

        {/* Affichage des posts */}
        <PostArea token={_token} />
      </main>
    </div>
  );
}