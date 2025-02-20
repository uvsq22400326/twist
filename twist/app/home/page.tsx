"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "../grid.css";
import "./home.css";
import { pages } from "next/dist/build/templates/app-page";
import PostArea from "./postArea";

export default function HomePage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [errorPublier, setError] = useState("");
  const [_token, set_Token] = useState("");
  useEffect(() => {
    const token = sessionStorage.getItem("token");

    // Si pas de token, rediriger vers la page de login
    if (!token) {
      console.log("Token manquant, redirection vers login");
      router.push("/login");
    }
    if (token != null) {
      set_Token(token);
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("token"); // Supprime le token
    router.push("/login"); //vers page login
  };

  const displaySidebar = () => {
    var sidebar = document.getElementById("nav-sidebar");
    var twist_area = document.getElementById("twist-area");
    var thisbutton = document.getElementById("open-sidebar");
    if (!displaying_sidebar) {
      if (sidebar) {
        sidebar.style.display = "block";
      }
      if (twist_area) {
        twist_area.style.display = "none";
      }
      if (thisbutton) {
        thisbutton.innerHTML = "&times;";
      }
      displaying_sidebar = true;
    } else {
      if (sidebar) {
        sidebar.style.display = "none";
      }
      if (twist_area) {
        twist_area.style.display = "block";
      }
      if (thisbutton) {
        thisbutton.innerHTML = "&#x27c1;";
      }
      displaying_sidebar = false;
    }
  };
  var displaying_sidebar = false;

  // Fonction pour publier un tweet
  const handlePostTweet = async () => {
    const token = sessionStorage.getItem("token");

    if (!content) {
      setError("Le contenu ne peut pas être vide !");
      return;
    }

    if (!token) {
      setError("Token manquant !");
      return;
    }

    try {
      const response = await fetch("/api/home/publier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Ajouter le token dans entete
        },
        body: JSON.stringify({ content }), // Contenu du tweet
      });

      const result = await response.json();
      if (response.ok) {
        setError("");
        alert("Tweet publié avec succès !");
        setContent("");
      } else {
        setError(result.error || "Erreur lors de la publication du tweet");
      }
    } catch (error) {
      console.log(error);
      setError("Erreur serveur");
    }
  };

  const afficherTwistsHome = async () => {
    console.log("afficherTwistsHome");
    const link = "http:/localhost:3000/api/home/posts";
    try {
      const response = await fetch("/api/home/posts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const res = await response.json();
      let rows = res.content;
      console.log("rows = " + rows);
    } catch (err) {
      console.log("error: afficherTwistsHome : " + err);
    }
  };

  return (
    <div>
      <aside className="col-3" id="nav-sidebar">
        <img src="/twist-logo.png" alt="Twist Logo" id="logo" />
        <nav>
          <a href="#" className="sidebar-item">
            Accueil
          </a>
          <br />
          <a href="#" className="sidebar-item">
            Recherche
          </a>
          <br />
          <a href="#" className="sidebar-item">
            Messages
          </a>
          <br />
          <a href="#" className="sidebar-item">
            Notifications
          </a>
          <br />
          <a href="/profil" className="sidebar-item">
            Profil
          </a>
          <br />
        </nav>
      </aside>
      <button id="open-sidebar" onClick={() => displaySidebar()}>
        &#x27c1;
      </button>
      <br />
      <button onClick={handleLogout} id="logout-button">
        Déconnexion
      </button>

      {/* Contenu principal */}
      <main className="col-8" id="twist-area">
        <div>
          <textarea
            placeholder="Quoi de neuf ?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <br />
          <br />
          <button id="publier-button" onClick={handlePostTweet}>
            Publier
          </button>
          <br />
          <br />
          {errorPublier && <p style={{ color: "red" }}>{errorPublier}</p>}{" "}
          {/* Afficher l'erreur s'il y en a une */}
        </div>
        {PostArea(_token)}
      </main>
    </div>
  );
}
