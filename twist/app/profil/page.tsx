"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./profil.css";
import PostArea from "./postArea";
import React from "react";
import LikeArea from "./likeArea"; 
import useSWR from "swr";
import Suggestions from "./suggestions";


interface User {
    id: number;
    username: string;
    profilePic: string | null;
    bio: string | null;
}


export default function Profil() {
    const router = useRouter();
    const [_token, set_Token] = useState<string | null>(null);
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [username, setUsername] = useState<string>("Utilisateur");
    const [bio, setBio] = useState("");
    const [followers, setFollowers] = useState(0);
    const [following, setFollowing] = useState(0);
    const [followersList, setFollowersList] = useState<User[]>([]);
    const [followingList, setFollowingList] = useState<User[]>([]);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [newBio, setNewBio] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [hasProfilePic, setHasProfilePic] = useState<boolean>(false);
    const [removeProfilePic, setRemoveProfilePic] = useState(false);
    const [showLikes, setShowLikes] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<{ users: any[]; posts: any[] } | null>(null);
const [isSearching, setIsSearching] = useState(false); 
    const resetEditMode = () => {
        setPreviewUrl(null);        
        setSelectedFile(null);      
        setRemoveProfilePic(false); 
        setNewBio(bio || "");
    };
    

        useEffect(() => {
            const hasReloaded = sessionStorage.getItem("hasReloaded-profile");
        
            if (!hasReloaded) {
            sessionStorage.setItem("hasReloaded-profile", "true");
            window.location.reload();
            } else {
            sessionStorage.removeItem("hasReloaded-profile"); 
            }
        }, []);

    useEffect(() => {
        const token = window.sessionStorage.getItem("token");
    if (!token) {
        router.replace("/login"); 
        return;
    }
    set_Token(token);
    
        fetch("/api/profil/info", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(res => res.json())
        .then(data => {
            setUsername(data.username);
            setProfilePic(data.profilePic);
            setBio(data.bio ?? ""); 
            setFollowing(data.following);
            setFollowers(data.followers);
            setHasProfilePic(data.profilePic !== "/default-profile.png");
    
        
        })
        .catch((error) => console.error("Erreur lors du chargement du profil:", error));

    
    }, [router]);
    
    

    const updateFollowingCount = (change: number) => {
        setFollowing(prevCount => prevCount + change);
    };
    

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async () => {
        if (!_token) return;
    
        const formData = new FormData();
    
        if (selectedFile) {
            formData.append("file", selectedFile);
        }
    
        formData.append("bio", newBio.trim());
    
        if (removeProfilePic) {
            formData.append("removeProfilePic", "true");
        }
    
        console.log("Envoi des données :", [...formData.entries()]);
    
        try {
            const response = await fetch("/api/profil/update", {
                method: "POST",
                headers: { Authorization: `Bearer ${_token}` },
                body: formData,
            });
    
            const data = await response.json();
            console.log("Réponse serveur :", data);
    
            if (response.ok) {
                setBio(data.bio || ""); 
                setNewBio("");
                setProfilePic(data.profilePic || "/default-profile.png"); 
                setRemoveProfilePic(false);
                setEditMode(false);
                setPreviewUrl(null);
                setSelectedFile(null);
            } else {
                alert("Erreur : " + data.error);
            }
        } catch (error) {
            console.error("Erreur serveur :", error);
        }
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

    const handleDeleteProfilePicture = async () => {
        if (!_token) return;
    
        try {
            const response = await fetch("/api/profil/update", {
                method: "DELETE",
                headers: { Authorization: `Bearer ${_token}` },
            });
    
            const data = await response.json();
    
            if (response.ok) {
                setProfilePic("/default-profile.png");
                setHasProfilePic(false); 
            } else {
                alert("Erreur : " + data.error);
            }
        } catch (error) {
            console.error("Erreur serveur :", error);
        }
    };
    
    const fetcher = async (url: string) => {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${_token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des likes.");
        }
        return response.json();
    };
    
    const { data, error, isLoading } = useSWR(_token ? `/api/like/likedPosts` : null, fetcher);
    


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
    
    
    

    return (

        
        <div className="profile-wrapper">

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
          </a>
          <a href="/profil" className="sidebar-item">
            Profil
          </a>
        </nav>
      </aside>

             <div className="vertical-line left"></div> 
             <div className="vertical-line right"></div>
        <div className="profile-container">

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
    {_token ? <Suggestions userId={1} updateFollowingCount={updateFollowingCount} /> : <p>Chargement...</p>}

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
            <div id="profile_img_box" style={{ backgroundImage: `url(${profilePic || "/default-profile.png"})` }}></div>
            <div className="profile-info-container">
    <div className="profile-info">
        <h2>@{username}</h2>
        {bio && <p className="user-bio">{bio}</p>}
    </div>

    <button className="edit-profile-btn" onClick={() => { resetEditMode(); setEditMode(true); }}>
        Modifier le profil
    </button>
</div>

            </div>

            {editMode && (
    <div className="modal-overlay">
        <div className="modal-content">
        <button className="close-btn" onClick={() => { resetEditMode(); setEditMode(false); }}>✕</button>
        <h2>Modifier le profil</h2>

            <div className="profile-edit-container">
            <img 
    src={removeProfilePic ? "/default-profile.png" : previewUrl || profilePic || "/default-profile.png"} 
    alt="Profil" 
    className="profile-pic-preview" 
/>
                <label className="camera-icon">
                    <img src="/icons/appareil-photo.png" alt="Modifier la photo" />
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
                </label>
            </div>

           

            {(profilePic || previewUrl) && !removeProfilePic && (
    <button className="delete-pic-btn" onClick={() => setRemoveProfilePic(true)}>
        Supprimer la photo
    </button>
)}



            <textarea className="bio-input" value={newBio} onChange={(e) => setNewBio(e.target.value)} placeholder="Biographie..."></textarea>

            <div className="modal-actions">
                <button className="save-btn" onClick={handleUpdateProfile}>Sauvegarder</button>
                <button className="cancel-btn" onClick={() => { resetEditMode(); setEditMode(false); }}>Annuler</button>
                </div>
        </div>
    </div>
)}

            <div className="follow-info">
                <p onClick={fetchFollowers} className="clickable"><strong>{followers}</strong> abonnés</p>
                <p onClick={fetchFollowing} className="clickable"><strong>{following}</strong> abonnements</p>
            </div>


<div className="row toggle-container">
    <h1 
        className={!showLikes ? "active" : ""} 
        onClick={() => setShowLikes(false)}
    >
        Mes posts
    </h1>
    <h1 
        className={showLikes ? "active" : ""} 
        onClick={() => setShowLikes(true)}
    >
        Mes likes
    </h1>
</div>

<div id="mes_posts_container">
    {!showLikes ? <PostArea token={_token} /> : <LikeArea token={_token} />}
</div>



            </div>
            

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
