export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="fr">
        <body>
          <header style={styles.header}>
            <h1>Bienvenue sur Twist</h1>
          </header>
  
          <main style={styles.main}>{children}</main>
  
          <footer style={styles.footer}>
            <p>© 2025 - Twist App</p>
          </footer>
        </body>
      </html>
    );
  }
  
  const styles = {
    header: { padding: "10px", background: "#f2f2f2", textAlign: "center", fontWeight: "bold" },
    main: { padding: "20px", textAlign: "center" },
    footer: { padding: "10px", background: "#eee", textAlign: "center", marginTop: "20px" },
  };
  