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
    
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [_token, set_Token] = useState<string | null>(null);
    const [showLikes, setShowLikes] = useState(false);

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

            <div className="profile-container">
                <div className="profile-header">
                    <img 
                        src={user.profilePic || "/default-profile.png"} 
                        alt="Photo de profil" 
                        className="profile-pic" 
                    />
                    <div className="profile-info-container">
                        <h2>@{user.username}</h2>
                        {user.bio && <p className="user-bio">{user.bio}</p>}
                    </div>
                </div>

                {isOwnProfile && (
                    <button onClick={() => router.push("/edit-profile")}>Modifier le profil</button>
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
                    {!showLikes ? <PostArea token={_token} userId={id ? Number(id) : undefined} /> : <LikeArea token={_token} />}
                </div>

            </div>
        </div>
    );
}
