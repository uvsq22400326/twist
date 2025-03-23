"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../grid.css";
import "../home/home.css"; 
import "./notifications.css";

export default function NotificationsPage() {
  interface Notification {
    id: string;
    type: string;
    sourceUsername: string;
    sourceUserId: string;
    seen: boolean;
    timestamp: string; 
  }

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = sessionStorage.getItem("token");
      const res = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setNotifications(data);
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const fetchUnseenCount = async () => {
      const token = sessionStorage.getItem("token");
      const res = await fetch("/api/notifications/unseenCount", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUnseenCount(data.count);
    };

    fetchUnseenCount();
  }, []);

  const markAsSeen = async () => {
    const token = sessionStorage.getItem("token");
    await fetch("/api/notifications/markAsSeen", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // Refresh notifications
    const res = await fetch("/api/notifications", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setNotifications(data);
  };

  useEffect(() => {
    markAsSeen();
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const query = (e.target as HTMLInputElement).value;
        router.push(`/search?q=${query}`);
      }
    };

    const handleLogout = () => {
      sessionStorage.removeItem("token");
      router.push("/login");
    };

    const formatTimeAgo = (timestamp?: string) => {
      if (!timestamp) return "il y a ?"; 
    
      const now = new Date();
      const past = new Date(timestamp);
    
      if (isNaN(past.getTime())) return "il y a ?"; 
    
      const diff = Math.floor((now.getTime() - past.getTime()) / 1000);
    
      if (diff < 60) return `il y a ${diff}s`;
      if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
      if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
      if (diff < 604800) return `il y a ${Math.floor(diff / 86400)}j`;
      return `il y a ${Math.floor(diff / 604800)}sem`;
    };
    
    
  return (
    <div className="container">
      <aside className="col-3" id="nav-sidebar">
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

      <div className="main-content"></div>
      <div className="vertical-line"></div>

      <main id="twist-area">
        <h2>Notifications</h2>
        <div className="notifications-list">
        {notifications.map((notification) => (
  <div
    key={notification.id}
    className={`notification-item ${notification.seen ? "" : "unseen"}`}
  >
    <div className="notification-content">
      <span className="notification-text">
        {notification.type === "follow" && (
          <>
            <strong
              className="clickable-username"
              style={{ cursor: "pointer" }}
              onClick={() => router.push(`/user/${notification.sourceUserId}`)}
            >
              @{notification.sourceUsername}
            </strong>{" "}
            a commencé à vous suivre
          </>
        )}
        {notification.type === "like" && (
          <>
            <strong
              className="clickable-username"
              style={{ cursor: "pointer" }}
              onClick={() => router.push(`/user/${notification.sourceUserId}`)}
            >
              @{notification.sourceUsername}
            </strong>{" "}
            a aimé votre publication
          </>
        )}
      </span>
      <span className="notification-time">
        {formatTimeAgo(notification.timestamp)}
      </span>
    </div>
  </div>
))}

      </div>
      <div className="vertical-line right"></div>

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
    <header>
        <input
          type="text"
          placeholder="Rechercher..."
          onKeyDown={handleSearch}
        />
        <div className="user-menu">
          
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
    </div>
  );
}
