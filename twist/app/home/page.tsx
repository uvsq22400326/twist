"use client";

/*import styles from "./home.module.css"; */
import { useRouter } from "next/navigation";
import "../grid.css"
import "./home.css"

export default function HomePage() {
  const router = useRouter();
  const displaySidebar = () => {
    var sidebar = document.getElementById('nav-sidebar');
    var twist_area = document.getElementById('twist-area');
    var thisbutton = document.getElementById('open-sidebar');
    if (!displaying_sidebar) {
      if (sidebar) {
        sidebar.style.display = 'block';
      }
      if (twist_area) {
        twist_area.style.display = 'none'
      }
      if (thisbutton) {
        thisbutton.innerHTML = '&times;';
      }
      displaying_sidebar = true;
    } else {
      if (sidebar) {
        sidebar.style.display = 'none';
      }
      if (twist_area) {
        twist_area.style.display = 'block'
      }
      if (thisbutton) {
        thisbutton.innerHTML = '&#x27c1;';
      }
      displaying_sidebar = false;
    }
  }
  var displaying_sidebar = false;

  return (
    <div>
      {/* barre tae gauche */}
      <aside className='col-3' id='nav-sidebar'>
        <img src="/twist-logo.png" alt="Twist Logo" id='logo'/>
        <nav>
          <a href="#" className="sidebar-item">Accueil</a>
          <br></br>
          <a href="#" className="sidebar-item">Recherche</a>
          <br></br>
          <a href="#" className="sidebar-item">Messages</a>
          <br></br>
          <a href="#" className="sidebar-item">Notifications</a>
          <br></br>
          <a href="/profil" className="sidebar-item">Profil</a>
          <br></br>
        </nav>
      </aside>
      <button id="open-sidebar" onClick={() => {
        displaySidebar();
      }}>
          &#x27c1;
      </button>
      <br></br>
      <button
          onClick={() => {
            sessionStorage.removeItem("user");
            router.push("/login");
          }}
          id="logout-button"
        >
          Déconnexion
      </button>
      {/* contenu principal */}
      <main className="col-8" id='twist-area'>
        <div>
          <textarea placeholder="Quoi de neuf ?"/>
          <br></br>
          <br></br>
          <button id="publier-button">Publier</button>
          <br></br>
          <br></br>
        </div>
        
        <div>
          <div>
            <p id="post-area">Aucun post pour le moment.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
