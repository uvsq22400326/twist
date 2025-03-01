"use client";
import { useState } from "react";
import useSWR from "swr";
import "./home.css";

const follow = async (user2: string, token: string) => {
    await fetch("/api/auth/follow", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user2 }),
    });
};

// Fonction pour extraire l'ID utilisateur depuis le token
const getUserIdFromToken = (token: string): string | null => {
    try {
        if (!token || token.split(".").length !== 3) {
            console.error("Token JWT invalide :", token);
            return null;
        }

        const base64Url = token.split(".")[1]; 
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); 
        const payload = JSON.parse(atob(base64));

        return payload.user_id || null;
    } catch (error) {
        console.error("Erreur de décodage du token :", error);
        return null;
    }
};


export default function PostArea({ token }: { token: string }) {
    const [likedPosts, setLikedPosts] = useState<{ [key: string]: boolean }>({});
    const [likeCounts, setLikeCounts] = useState<{ [key: string]: number }>({});
    const userId = getUserIdFromToken(token);

    const handleLike = async (msg_id: string, initialLikes: number, token: string) => {
        const alreadyLiked = likedPosts[msg_id] || false;

        setLikedPosts(prev => ({
            ...prev,
            [msg_id]: !alreadyLiked
        }));

        setLikeCounts(prev => ({
            ...prev,
            [msg_id]: alreadyLiked ? (prev[msg_id] ?? initialLikes) - 1 : (prev[msg_id] ?? initialLikes) + 1
        }));

        await fetch("/api/like", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ msg_id }),
        });
    };

    const fetcher = (url: string) => fetch(url).then(res => res.json().then(data => data.content));
    const { data, error, isLoading } = useSWR("/api/home/posts", fetcher);

    if (isLoading) return <div><p>Chargement des messages...</p></div>;
    if (error) return <div><p>Erreur lors du chargement</p></div>;

    return (
        <div id="twist-area">
            {data?.map((post, i) => (
                <div key={i} className="post-box">
                    <button 
                        className="follow-button" 
                        onClick={() => follow(post.user_id, token)}
                        disabled={post.user_id === userId} // Empêche l'auto-follow
                    >
                        Follow
                    </button>

                    {/* Affichage du username au lieu de l'email */}
                    <p><strong>@{post.username || "Utilisateur"}</strong></p>

                    <p>{post.content}</p>

                    {/* Affichage des médias */}
                    {post.media_url && (
                        post.media_url.includes("video") ? (
                            <video controls>
                                <source src={post.media_url} type="video/mp4" />
                                <source src={post.media_url} type="video/webm" />
                                <source src={post.media_url} type="video/ogg" />
                            </video>
                        ) : (
                            <img src={post.media_url} alt="Image postée" />
                        )
                    )}

                    {/* Bouton Like */}
                    <button 
                        className={`like-button ${likedPosts[post.id] ? "liked" : ""}`} 
                        onClick={() => handleLike(post.id, post.like_count, token)}
                    >
                        <svg className="heart-icon" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                        </svg>
                        <span>{likeCounts[post.id] ?? post.like_count}</span>
                    </button>
                </div>
            ))}
        </div>
    );
}
