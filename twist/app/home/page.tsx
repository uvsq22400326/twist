"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "../grid.css";
import "./home.css";
import PostArea from "./postArea";
import React from "react";

export default function HomePage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null); // ajout du state pour l'aperçu de img ou vd avant de publier

  const [errorPublier, setError] = useState("");
  const [_token, set_Token] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);

  const [username, setUsername] = useState("Utilisateur");
  const [profilePic, setprofilePic] = useState("/default-profile.png");
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;
  
      try {
        const response = await fetch("/api/messages/unreadCount", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          console.log("Nombre de messages non lus :", data.count);
          setUnreadMessages(data.count);
        }
      } catch (error) {
        console.error("Erreur récupération messages non lus :", error);
      }
    };
  
    fetchUnreadMessages();
  
    const interval = setInterval(fetchUnreadMessages, 10000);
    return () => clearInterval(interval);
  }, []);
  


  const fetchUserProfile = async () => {
      const token = sessionStorage.getItem("token");
  
      if (!token) return;
  
      try {
          const res = await fetch("/api/profil/info", {
              headers: { Authorization: `Bearer ${token}` },
          });
  
          if (!res.ok) {
              throw new Error("Impossible de récupérer les infos du profil");
          }
  
          const data = await res.json();
          console.log("Profil récupéré :", data);
  
          setUsername(data.username || "Utilisateur");
          setprofilePic(data.profilePic || "/default-profile.png");
      } catch (error) {
          console.error("Erreur lors du chargement du profil :", error);
      }
  };
  
  useEffect(() => {
      fetchUserProfile();
  }, []);
  
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    console.log("Token récupéré depuis sessionStorage :", token);

    if (!token || token == "") {
      console.log("Token manquant, redirection vers login");
      router.push("/login");
    } else {
      set_Token(token);
    }
  }, [router]);

  useEffect(() => {
    const fetchUnseenCount = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("/api/notifications/unseenCount", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setUnseenCount(data.count);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des notifications non lues :",
          error
        );
      }
    };

    fetchUnseenCount();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    router.push("/login");
  };

  const handlePostTweet = async () => {
    const token = sessionStorage.getItem("token");

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/ogg",
    ];

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
      if (response.status == 200) {
        setError("");
        alert("Tweet publié !");
        setContent("");
        setFile(null);
        setPreview(null);
      } else {
        setError(result.error || "Erreur lors de la publication.");
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
      setError("Erreur serveur.");
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const query = (e.target as HTMLInputElement).value;
      router.push(`/search?q=${query}`);
    }
  };

  return (

    
    <div>
      <aside className="col-3" id="nav-sidebar">
      <div className="vertical-line"></div>

        <img src="/twist-logo.png" alt="Twist Logo" id="logo" />
        <nav>
          <a href="/home" className="sidebar-item">
            Accueil
          </a>
          <a href="/search" className="sidebar-item">
            Recherche
          </a>
          <a href="/messages" className="sidebar-item">
  Messages
  {unreadMessages > 0 && (
    <span className="notification-dot">{unreadMessages}</span>
  )}
</a>

          <a href="/notifications" className="sidebar-item">
            Notifications
            {unseenCount > 0 && (
              <span className="notification-dot">{unseenCount}</span>
            )}
          </a>
          <a href="/profil" className="sidebar-item">
            Profil
          </a>
        </nav>
      </aside>
      <header>
    <input
      type="text"
      placeholder="Rechercher..."
      onKeyDown={handleSearch}
    />
    <div className="user-menu">
      
      <div className="user-info" onClick={() => router.push("/profil")}>
        <img 
          src={profilePic || "/default-profile.png"} 
          alt="Profil" 
          className="header-profile-pic" 
        />
        <span className="header-username">{username || "Utilisateur"}</span>
      </div>

      <span className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
        ⋮
      </span>

      {showMenu && (
        <div className="dropdown-menu">
          <button onClick={handleLogout}>Se déconnecter</button>
        </div>
      )}
    </div>
</header>


      <main id="twist-area">
      <div className="vertical-line right"></div>

        <div className="tweet-box">
          <textarea
            placeholder="Ca dit quoi frérot?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="tweet-actions">
            {/* icone pour uploader une image/vidéo */}
            <label htmlFor="file-upload" className="icon-label">
              <img src="/icons/image.png" alt="Ajouter une image ou vidéo" />
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/png, image/jpeg, image/gif, image/webp, video/mp4, video/webm, video/ogg"
              className="hidden-input"
              onChange={(e) => {
                if (e.target.files) {
                  const selectedFile = e.target.files[0];
                  setFile(selectedFile);

                  // gener un petit appercu si le fichier est valide
                  if (selectedFile) {
                    const fileUrl = URL.createObjectURL(selectedFile);
                    setPreview(fileUrl);
                  } else {
                    setPreview(null);
                  }
                }
              }}
            />

            {/* affiche appercu en petit */}
            {preview && (
              <div className="preview-container">
                {file?.type.startsWith("video/") ? (
                  <video src={preview} className="preview-media" muted />
                ) : (
                  <img src={preview} className="preview-media" alt="Aperçu" />
                )}
              </div>
            )}

            {/* Bouton Publier */}
            <button className="publish-button" onClick={handlePostTweet}>
              Publier
            </button>
          </div>
        </div>

        {errorPublier && <p className="error-text">{errorPublier}</p>}
        {_token ? <PostArea token={_token} /> : <p>Chargement...</p>}
      </main>

<div className="bottom-navbar">
  <a href="/home">
    <img src="/icons/home.png" alt="Accueil" />
  </a>
  <a href="/search">
    <img src="/icons/search.png" alt="Recherche" />
  </a>
  <a href="/messages">
    <img src="/icons/messages.png" alt="Messages" />
  </a>
  <a href="/notifications">
    <img src="/icons/notifications.png" alt="Notifications" />
  </a>
  <a href="/profil">
    <img src="/icons/profile.png" alt="Profil" />
  </a>
</div>


    </div>
  );
}
