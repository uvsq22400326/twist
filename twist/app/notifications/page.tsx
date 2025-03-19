"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../grid.css";
import "../home/home.css"; // Use the same CSS as the home page

export default function NotificationsPage() {
  interface Notification {
    id: string;
    type: string;
    sourceUsername: string;
    seen: boolean;
  }

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const router = useRouter();

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

      <main id="twist-area">
        <h2>Notifications</h2>
        <ul>
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={notification.seen ? "" : "unseen"}
            >
              <div className="post-box">
                {notification.type === "follow" && (
                  <p>@{notification.sourceUsername} a commencé a vous suivre.</p>
                )}

                {notification.type === "like" && (
                  <p>@{notification.sourceUsername} a aimé votre publication.</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
