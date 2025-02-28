"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "../grid.css";
import "./home.css";
import PostArea from "./postArea";

export default function HomePage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errorPublier, setError] = useState("");
  const [_token, set_Token] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.log("Token manquant, redirection vers login");
      router.push("/login");
    } else {
      set_Token(token);
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("token"); 
    router.push("/login");
  };

  const handlePostTweet = async () => {
    const token = sessionStorage.getItem("token");

    const allowedTypes = ["image/png", "image/jpeg", "image/gif", "image/webp", "video/mp4", "video/webm", "video/ogg"];

    if (!content && !file) {
      setError("Le contenu ou un fichier est requis !");
      return;
    }

    if (file && !allowedTypes.includes(file.type)) {
      setError("Fichiers autorisés : PNG, JPG, GIF, WEBP, MP4, WEBM, OGG !");
      return;
    }

    if (!token) {
      setError("Token manquant !");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("content", content);
      if (file) formData.append("file", file);

      const response = await fetch("/api/home/publier", {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (response.ok) {
        setError("");
        alert("Tweet publié !");
        setContent("");
        setFile(null);
      } else {
        setError(result.error || "Erreur lors de la publication.");
      }
    } catch (error) {
      console.error(error);
      setError("Erreur serveur.");
    }
  };

  return (
    <div>
      <aside className="col-3" id="nav-sidebar">
        <img src="/twist-logo.png" alt="Twist Logo" id="logo" />
        <nav>
          <a href="#" className="sidebar-item">Accueil</a>
          <a href="#" className="sidebar-item">Recherche</a>
          <a href="/messages" className="sidebar-item">Messages</a>
          <a href="#" className="sidebar-item">Notifications</a>
          <a href="/profil" className="sidebar-item">Profil</a>
        </nav>
      </aside>

      <header>
        <input type="text" placeholder="Rechercher..." />
        <div className="user-menu">
          <span className="menu-icon" onClick={() => setShowMenu(!showMenu)}>⋮</span>
          {showMenu && <div className="dropdown-menu"><button onClick={handleLogout}>Se déconnecter</button></div>}
        </div>
      </header>

      <main id="twist-area">
        <div className="tweet-box">
          <textarea placeholder="Quoi de neuf ?" value={content} onChange={(e) => setContent(e.target.value)} />
          <button onClick={handlePostTweet}>Publier</button>
        </div>
        {errorPublier && <p className="error-text">{errorPublier}</p>}
        <PostArea token={_token} />
      </main>
    </div>
  );
}
