"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    setIsAuthenticated(!!user);
  }, []);

  return (
    <html lang="fr">
      <body>
        {isAuthenticated && pathname !== "/login" && pathname !== "/register" && (
          <aside className="sidebar">
            <h2 className="logo">Twist</h2>
            <nav>
              <Link href="/home">Accueil</Link>
              <Link href="/search">Recherche</Link>
              <Link href="/messages">Messages</Link>
              <Link href="/profile">Profil</Link>
              <button
                onClick={() => {
                  sessionStorage.removeItem("user");
                  router.push("/login");
                }}
                className="logout"
              >
                Déconnexion
              </button>
            </nav>
          </aside>
        )}

        <main>{children}</main>
      </body>
    </html>
  );
}
