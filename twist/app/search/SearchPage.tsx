"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "../grid.css";
import "../home/home.css"; // Use the same CSS as the home page
import React from "react";
import "./search.css";


export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams ? searchParams.get("q") || "" : "";
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<{ users: any[]; posts: any[] }>({
    users: [],
    posts: [],
  });
  const [likedPosts, setLikedPosts] = useState<{ [key: string]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [key: string]: number }>({});
  const [following, setFollowing] = useState<{ [key: string]: boolean }>({});
  const [showMenu, setShowMenu] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const userId = "currentUserId"; 
  const [activeTab, setActiveTab] = useState(""); 

  useEffect(() => {
    if (query) {
      fetchResults(query);
      setActiveTab("users"); 
    }
  }, [query]);

  useEffect(() => {
    const fetchInitialStates = async () => {
      try {
        const token = sessionStorage.getItem("token");

        // Fetch following state
        const followRes = await fetch("/api/auth/following", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const followData = await followRes.json();
        if (followRes.ok) {
          const followingState = followData.reduce(
            (acc: { [key: string]: boolean }, user: { id: string }) => {
              acc[user.id] = true;
              return acc;
            },
            {}
          );
          setFollowing(followingState);
        }

        // Fetch liked posts state
        const likeRes = await fetch("/api/like/likedPosts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const likeData = await likeRes.json();
        if (likeRes.ok) {
          const likedState = likeData.reduce(
            (acc: { [key: string]: boolean }, post: { id: string }) => {
              acc[post.id] = true;
              return acc;
            },
            {}
          );
          setLikedPosts(likedState);
        }
      } catch (error) {
        console.error("Error fetching initial states:", error);
      }
    };

    fetchInitialStates();
  }, []);


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


  const fetchResults = async (query: string) => {
    try {
      const res = await fetch(`/api/search?q=${query}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        console.log("Search results:", data); 
        const filteredUsers = data.users.filter((user: { user_id: string }) => user.user_id !== userId);
        setResults({
          users: filteredUsers,
          posts: data.posts,
        });
      } else {
        throw new Error("Received non-JSON response");
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };
  

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      router.push(`/search?q=${searchQuery}`);
    }
  };

  const handleSearchIconClick = () => {
    if (searchQuery.trim() !== "") {
      router.push(`/search?q=${searchQuery}`);
    }
  };
  
  const handleFollow = async (userId: string) => {
    try {
      const token = sessionStorage.getItem("token");
      const isFollowing = following[userId] || false;
      const res = await fetch(`/api/auth/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ToFollow: userId,
        },
        body: JSON.stringify({ userId, isFollowing }),
      });
      if (res.ok) {
        setFollowing((prev) => ({
          ...prev,
          [userId]: !isFollowing,
        }));
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };
  const handleLike = async (postId: string, initialLikes: number) => {
    const alreadyLiked = likedPosts[postId] || false;
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !alreadyLiked,
    }));

    setLikeCounts((prev) => ({
      ...prev,
      [postId]: alreadyLiked
        ? (prev[postId] ?? initialLikes) - 1
        : (prev[postId] ?? initialLikes) + 1,
    }));

    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`/api/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    router.push("/login");
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

      <div className="main-content">
      <div className="vertical-line"></div>

        <header>
        <div className="search-input-wrapper">
  <img 
    src="/icons/searchpp.png" 
    alt="🔍" 
    className="search-icon-inside" 
    onClick={handleSearchIconClick}
  />
  <input
    type="text"
    className="search-input"
    placeholder="Rechercher..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    onKeyDown={handleSearch}
  />
</div>

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

        <main id="search-res">
        <h2>Recherches</h2>

        {!query && <p className="search-placeholder">Arrête de stalk les gens stp</p>}

        {query && (
          <div className="search-tabs">
            <button 
              className={activeTab === "users" ? "active" : ""}
              onClick={() => setActiveTab("users")}
            >
              Utilisateurs
            </button>
            <button 
              className={activeTab === "posts" ? "active" : ""}
              onClick={() => setActiveTab("posts")}
            >
              Posts
            </button>
          </div>
        )}

        <div className="search-resultss">
          {activeTab === "users" && (
            <div>
              <h3>Utilisateurs trouvés</h3>
              {results.users.length === 0 ? <p>Aucun utilisateur trouvé.</p> : (
                <ul>
                  {results.users &&
                results.users.map((user) => (
                  <div key={user.id} className="post-box">
                  <button
                    className="follow-button"
                    onClick={() => handleFollow(user.user_id)}
                    disabled={user.user_id === userId} 
                  >
                    {following[user.id] ? "Ne plus suivre" : "Suivre"}
                  </button>

                  <p>
                  <strong
  onClick={() => router.push(`/user/${user.id}`)}
  className="clickable-username"
>
  @{user.username}
</strong>


                </p>
                  </div>
                ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "posts" && (
            <div>
              <h3>Posts trouvés</h3>
              {results.posts.length === 0 ? <p>Aucun post trouvé.</p> : (
                <ul>
                 {results.posts &&
                results.posts.map((post) => (
                  <div key={post.id} className="post-box">
                    <button
                      className="follow-button"
                      onClick={() => handleFollow(post.user_id)}
                      disabled={post.user_id === userId} 
                    >
                      {following[post.user_id] ? "Ne plus suivre" : "Suivre"}
                    </button>

                    <p>
                    <strong
  onClick={() => router.push(`/user/${post.user_id}`)}
  className="clickable-username"
  style={{ cursor: "pointer" }}
>
  @{post.username}
</strong>

              </p>
                    <p>{post.content}</p>
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt="Post image"
                        className="post-image"
                      />
                    )}

                    <button
                      className={`like-button ${
                        likedPosts[post.id] ? "liked" : ""
                      }`}
                      onClick={() => handleLike(post.id, post.like_count)}
                    >
                      <svg className="heart-icon" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                      </svg>
                      <span>{likeCounts[post.id] ?? post.like_count}</span>
                    </button>
                  </div>
                ))}

                </ul>
              )}
            </div>
            
          )}
          
        </div>
        <div className="vertical-line right"></div>

        </main>
      </div>
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
