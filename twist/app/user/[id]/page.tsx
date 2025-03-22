"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import "./profil.css";
import PostArea from "./postArea";
import LikeArea from "./likeArea";
import useSWR from "swr";
import Suggestions from "./suggestions";
import React from "react";


interface User {
    id: number;
    username: string;
    profilePic: string | null;
    bio: string | null;
}

export default function ProfilePage() {
    const { id } = useParams();
    const isOwnProfile = !id;
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<{ users: any[]; posts: any[] } | null>(null);
    const [isSearching, setIsSearching] = useState(false); 
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [_token, set_Token] = useState<string | null>(null);
    const [showLikes, setShowLikes] = useState(false);
   const [followers, setFollowers] = useState(0);
       const [following, setFollowing] = useState(0);
       const [followersList, setFollowersList] = useState<User[]>([]);
       const [followingList, setFollowingList] = useState<User[]>([]);
       const [showFollowers, setShowFollowers] = useState(false);
       const [showFollowing, setShowFollowing] = useState(false);
       const [isFollowing, setIsFollowing] = useState(false); 
       const [suggestions, setSuggestions] = useState<any[]>([]);
       const [suggestionKey, setSuggestionKey] = useState(Date.now()); 


       useEffect(() => {
        const token = window.sessionStorage.getItem("token");
        if (!token) {
            router.replace("/login");
            return;
        }
        set_Token(token);
    
        const fetchProfile = async () => {
            try {
                const endpoint = isOwnProfile ? "/api/profil/info" : `/api/profil/${id}`;
                const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
                if (!res.ok) throw new Error("Utilisateur non trouvé");
        
                const data = await res.json();
                setUser(data);
        
                const followersRes = await fetch("/api/profil/followers", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });
        
                const followingRes = await fetch("/api/profil/abonnements", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });
        
                const followersData = await followersRes.json();
                const followingData = await followingRes.json();
        
                if (followersRes.ok) setFollowers(followersData.followers.length);
                if (followingRes.ok) {
                    setFollowing(followingData.following.length);
                    setFollowingList(followingData.following);
                }
        
                setIsFollowing(followingData.following.some((u: { id: number }) => u.id === Number(id)));
        
            } catch (error) {
                console.error("Erreur lors du chargement du profil :", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        
    
        fetchProfile();
    }, [id, isOwnProfile, router]);
    
    

    if (loading) return <p>Chargement...</p>;
    if (!user) return <p>Utilisateur non trouvé</p>;

    const refreshSuggestions = async () => {
        try {
            const response = await fetch("/api/suggestions", {
                headers: { Authorization: `Bearer ${_token}` },
            });
    
            const data = await response.json();
            if (response.ok) {
                setSuggestions(data.suggestions);
                 setSuggestionKey(Date.now()); 
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour des suggestions :", error);
        }
    };
    

    const handleFollow = async () => {
        if (!_token || !id) return;
    
        try {
            await fetch(`/api/auth/follow`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${_token}`,
                    ToFollow: id.toString(), 
                },
            });
    
            setIsFollowing((prev) => !prev);
            setFollowers((prev) => (isFollowing ? prev - 1 : prev + 1));

            refreshSuggestions(); 
        } catch (error) {
            console.error("Erreur lors du suivi :", error);
        }
    };
    


     const handleSearch = async (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter" && searchQuery.trim() !== "") {
                setIsSearching(true); 
        
                try {
                    const res = await fetch(`/api/search?q=${searchQuery}`);
                    if (!res.ok) {
                        throw new Error("Erreur lors de la recherche.");
                    }
                    const data = await res.json();
                    setSearchResults(data); 
                } catch (error) {
                    console.error("Erreur de recherche :", error);
                    setSearchResults(null); 
                }
            }
        };
    
        const handleSearchIconClick = async () => {
            if (searchQuery.trim() !== "") {
                setIsSearching(true); 
        
                try {
                    const res = await fetch(`/api/search?q=${searchQuery}`);
                    if (!res.ok) {
                        throw new Error("Erreur lors de la recherche.");
                    }
                    const data = await res.json();
                    setSearchResults(data); 
                } catch (error) {
                    console.error("Erreur de recherche :", error);
                    setSearchResults(null); 
                }
            }
        };

        const updateFollowingCount = (change: number) => {
            setFollowing(prevCount => prevCount + change);
        };


    
        const fetchFollowers = async () => {
            if (!_token) return;
    
            try {
                const response = await fetch("/api/profil/followers", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${_token}` },
                });
    
                const data = await response.json();
                if (response.ok) {
                    setFollowersList(data.followers || []);
                    setShowFollowers(true);
                }
            } catch (error) {
                console.error("Erreur récupération followers :", error);
            }
        };
    
        const fetchFollowing = async () => {
            if (!_token) return;
    
            try {
                const response = await fetch("/api/profil/abonnements", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${_token}` },
                });
    
                const data = await response.json();
                if (response.ok) {
                    setFollowingList(data.following || []);
                    setShowFollowing(true);
                }
            } catch (error) {
                console.error("Erreur récupération abonnements :", error);
            }
        };
        
    return (
        <div className="profile-wrapper">
            <aside className="col-3" id="nav-sidebar">
                <img src="/twist-logo.png" alt="Twist Logo" id="logo" />
                <nav>
                    <a href="/home" className="sidebar-item">Accueil</a>
                    <a href="/search" className="sidebar-item">Recherche</a>
                    <a href="/messages" className="sidebar-item">Messages</a>
                    <a href="/notifications" className="sidebar-item">Notifications</a>
                    <a href="/profil" className="sidebar-item">Profil</a>
                </nav>
            </aside>

            <div className="vertical-line left"></div> 
            <div className="vertical-line right"></div>

            <div className="profile-container" style={{ minHeight: "100vh" }}>
            <div className="search-bar">
                    <img 
                        src="/icons/searchpp.png" 
                        alt="🔍" 
                        className="search-icon" 
                        onClick={() => handleSearchIconClick()} 
                    />
                
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>
                
                <div className="suggestions-container">
                {_token ? <Suggestions key={suggestionKey} userId={1} updateFollowingCount={updateFollowingCount} refreshSuggestions={refreshSuggestions} /> : <p>Chargement...</p>}
                </div>

                {isSearching && (
                    <>
                        <div className="search-overlay" onClick={() => setIsSearching(false)}></div>
                
                        <div className="search-results">
                            <button className="close-search" onClick={() => setIsSearching(false)}>✕</button>
                            <h3>Résultats de recherche</h3>
                
                            {searchResults && searchResults.users.length > 0 && (
                                <>
                                    <h4>Utilisateurs</h4>
                                    {searchResults.users.map(user => (
                                        <div key={user.id} className="search-user">
                                            <strong>@{user.username}</strong>
                                        </div>
                                    ))}
                                </>
                            )}
                
                            {searchResults && searchResults.posts.length > 0 && (
                                <>
                                    <h4>Posts</h4>
                                    {searchResults.posts.map(post => (
                                        <div key={post.id} className="search-post">
                                            <strong>@{post.username}</strong>
                                            <p>{post.content}</p>
                                            {post.imageUrl && <img src={post.imageUrl} alt="Post" />}
                                        </div>
                                    ))}
                                </>
                            )}
                
                            {searchResults && searchResults.users.length === 0 && searchResults.posts.length === 0 && (
                                <p>Aucun résultat trouvé.</p>
                            )}
                        </div>
                    </>
                )}



                <div className="profile-header">
                <img 
                src={user.profilePic && user.profilePic.trim() !== "" ? user.profilePic : "/default-profile.png"} 
                alt="Photo de profil" 
                className="profile-pic" 
                />
                    <div className="profile-info-container">
                        <h2>@{user.username}</h2>
                        {user.bio && <p className="user-bio">{user.bio}</p>}
                    </div>
                
                
    <div className="follow-info">
        <p onClick={fetchFollowers} className="clickable">
            <strong>{followers}</strong> abonnés
        </p>
        <p onClick={fetchFollowing} className="clickable">
            <strong>{following}</strong> abonnements
        </p>
    </div>



    {!isOwnProfile && (
        <div className="follow-button-container">
            <button onClick={handleFollow} className="follow-button">
                {isFollowing ? "Ne plus suivre" : "Suivre"}
            </button>
        </div>
    )}
</div>

                {isOwnProfile && (
                    <button onClick={() => router.push("/edit-profile")}>Modifier le profil</button>
                )}


                {showFollowers && (
    <div className="modal-overlay" onClick={() => setShowFollowers(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Abonnés</h3>
            <ul className="user-list">
                {followersList.length > 0 ? (
                    followersList.map((user) => (
                        <li key={user.id} className="user-item">
                            <img src={user.profilePic || "/default-profile.png"} alt="Profil" className="profile-pic" />
                            <div className="user-info">
                                <p>@{user.username}</p>
                                <small>{user.bio || "Aucune bio"}</small>
                            </div>
                        </li>
                    ))
                ) : (
                    <p>Aucun abonné.</p>
                )}
            </ul>
        <button className="close-modal-btn" onClick={() => { setShowFollowers(false); }}>✕</button>
        </div>
    </div>
)}

{showFollowing && (
    <div className="modal-overlay" onClick={() => setShowFollowing(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Abonnements</h3>
            <ul className="user-list">
                {followingList.length > 0 ? (
                    followingList.map((user) => (
                        <li key={user.id} className="user-item">
<img src={user.profilePic || "/default-profile.png"} alt="Profil" className="profile-pic" />
<div className="user-info">
                                <p>@{user.username}</p>
                                <small>{user.bio || "Aucune bio"}</small>
                            </div>
                        </li>
                    ))
                ) : (
                    <p>Aucun abonnement.</p>
                )}
            </ul>
            <button className="close-modal-btn" onClick={() => setShowFollowing(false)}>✕</button>
        </div>
    </div>
)}


<div className="row toggle-container">
                    <h1 
                        className={!showLikes ? "active" : ""} 
                        onClick={() => setShowLikes(false)}
                    >
                        Posts
                    </h1>
                    <h1 
                        className={showLikes ? "active" : ""} 
                        onClick={() => setShowLikes(true)}
                    >
                        Likes
                    </h1>
                </div>


                <div id="mes_posts_container">
                {!showLikes ? <PostArea token={_token} userId={id ? Number(id) : undefined} /> : <LikeArea token={_token} />}                </div>

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
