"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import React from "react";
import "./profil.css";

export default function PostArea({ token }: { token: string | null }) {
    const [showMenu, setShowMenu] = useState<number | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const fetcher = async (url: string) => {
        if (!token) return null;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des posts.");
        }
        return response.json();
    };

    const { data, error, isLoading, mutate } = useSWR(token ? `/api/profil/posts/${token}` : null, fetcher);

    useEffect(() => {
        if (data && data.posts) {
            mutate();
        }
    }, [data]);

    if (isLoading) return <p>Chargement des posts...</p>;
    if (error) return <p>Erreur lors du chargement des posts.</p>;
    if (!data || !data.posts || data.posts.length === 0) return <p>Aucun post trouvé.</p>;

    const formatDate = (dateString: string) => {
        const postDate = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - postDate.getTime(); // Différence en millisecondes
    
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
    
        console.log(`⏳ diffSeconds: ${diffSeconds}, diffMinutes: ${diffMinutes}, diffHours: ${diffHours}`);
    
        if (diffSeconds < 60) {
            return `${diffSeconds}s`; // 🔥 Moins d'une minute → secondes
        } else if (diffMinutes < 60) {
            return `${diffMinutes}min`; // 🔥 Moins d'une heure → minutes
        } else if (diffHours < 24) {
            return `${diffHours}h`; // 🔥 Moins d'un jour → heures
        } else {
            return postDate.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
            }); // 🔥 Plus d'un jour → format date
        }
    };
    

   const handleDeletePost = async (postId: number) => {
    const token = sessionStorage.getItem("token");

    if (!token) {
        alert("Erreur : Token manquant.");
        return;
    }

    if (!window.confirm("Es-tu sûr de vouloir supprimer ce post ?")) {
        return;
    }

    try {
        const response = await fetch(`/api/profil/posts?postId=${postId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = response.status !== 204 ? await response.json() : null; // ✅ Évite `Unexpected end of JSON`

        if (response.ok) {
            mutate(); // ✅ Met à jour la liste des posts après suppression
        } else {
            alert("Erreur : " + (data?.error || "Impossible de supprimer le post."));
        }
    } catch (error) {
        console.error("Erreur lors de la suppression :", error);
    }
};


    return (
        <div id="twist-area">
            {data.posts.map((post: any) => (
                <div key={post.id} className="post-box">
                    <div className="post-header">
                        <strong>@{post.username}</strong>
                        <span className="post-date">{formatDate(post.created_at)}</span>

                        {/* 🔥 Trois points pour ouvrir le menu */}
                        <span
                            className="menu-icon"
                            onClick={() => setShowMenu(showMenu === post.id ? null : post.id)}
                        >
                            ⋮
                        </span>

                        {/* 🔥 Menu déroulant bien placé */}
                        {showMenu === post.id && (
                            <div className="dropdown-menu">
                                <button onClick={() => setConfirmDelete(post.id)}>Supprimer le post</button>
                            </div>
                        )}
                    </div>

                    <p>{post.content}</p>
                    {post.media_url &&
                        (post.media_url.endsWith(".mp4") || post.media_url.endsWith(".webm") || post.media_url.endsWith(".ogg") ? (
                            <video controls>
                                <source src={post.media_url} type="video/mp4" />
                                <source src={post.media_url} type="video/webm" />
                                <source src={post.media_url} type="video/ogg" />
                            </video>
                        ) : (
                            <img src={post.media_url} alt="Image postée" />
                        ))
                    }

                    {/* 🔥 Modal de confirmation avec fond flou */}
                    {confirmDelete === post.id && (
                        <div className="modal-overlay">
                            <div className="confirm-box">
                                <p>Êtes-vous sûr de vouloir supprimer ce post ?</p>
                                <button onClick={() => handleDeletePost(post.id)}>Oui</button>
                                <button onClick={() => setConfirmDelete(null)}>Non</button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
