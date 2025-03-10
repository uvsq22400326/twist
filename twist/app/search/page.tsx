"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "../grid.css";
import "../home/home.css"; // Use the same CSS as the home page

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
  const [showMenu, setShowMenu] = useState(false);
  const userId = "currentUserId"; // Replace with the actual user ID logic

  useEffect(() => {
    if (query) {
      fetchResults(query);
    }
  }, [query]);

  const fetchResults = async (query: string) => {
    try {
      const res = await fetch(`/api/search?q=${query}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        console.log("Search results:", data); // Log the search results
        setResults(data);
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

  const handleFollow = async (userId: string) => {
    try {
      const res = await fetch(`/api/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        // Update the UI or state as needed
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
      const res = await fetch(`/api/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
          <a href="#" className="sidebar-item">
            Notifications
          </a>
          <a href="/profil" className="sidebar-item">
            Profil
          </a>
        </nav>
      </aside>

      <div className="main-content">
        <header>
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

        <main id="twist-area">
          <h2>Résultats de recherche pour "{query}"</h2>

          <section>
            <h3>Utilisateurs : </h3>
            <ul>
              {results.users &&
                results.users.map((user) => (
                  <li key={user.id} className="post-box">
                    {user.profilePicture && (
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="user-avatar"
                      />
                    )}
                    <strong>@{user.username}</strong>
                    <button
                      className="follow-button"
                      onClick={() => handleFollow(user.id)}
                      disabled={user.id === userId} // Empêche l'auto-follow
                    >
                      Follow
                    </button>
                  </li>
                ))}
            </ul>
          </section>

          <section>
            <h3>Posts : </h3>
            <ul>
              {results.posts &&
                results.posts.map((post) => (
                  <div key={post.id} className="post-box">
                    <button
                      className="follow-button"
                      onClick={() => handleFollow(post.user_id)}
                      disabled={post.user_id === userId} // Empêche l'auto-follow
                    >
                      Follow
                    </button>

                    <p>
                      <strong>@{post.username || "Utilisateur"}</strong>
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
          </section>
        </main>
      </div>
    </div>
  );
}
