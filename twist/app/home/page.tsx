"use client";

import styles from "./home.module.css";

export default function HomePage() {
  return (
    <div className={styles.container}>
      
      {/* barre tae gauche */}
      <aside className={styles.sidebar}>
        <img src="/twist-logo.png" alt="Twist Logo" className={styles.logo} />
        <nav className={styles.navMenu}>
          <a href="#" className={styles.navItem}>Accueil</a>
          <a href="#" className={styles.navItem}>Recherche</a>
          <a href="#" className={styles.navItem}>Messages</a>
          <a href="#" className={styles.navItem}>Notifications</a>
          <a href="#" className={styles.navItem}>Profil</a>
        </nav>
      </aside>

      {/* contenu principal */}
      <main className={styles.main}>
        <div className={styles.postBox}>
          <input type="text" placeholder="Quoi de neuf ?" className={styles.input} />
          <button className={styles.postButton}>Publier</button>
        </div>
        
        <div className={styles.feed}>
          <div className={styles.tweet}>
            <p>Aucun post pour le moment.</p>
          </div>
        </div>
      </main>

    
    </div>
  );
}
