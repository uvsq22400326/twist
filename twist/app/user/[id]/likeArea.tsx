"use client";

import { useState } from "react";
import useSWR from "swr";
import React from "react";
import "./profil.css";

const formatDate = (dateString: string) => {
    const postDate = new Date(dateString);
    const now = new Date();
    
    const diffMs = now.getTime() - postDate.getTime(); 
    const diffHours = diffMs / (1000 * 60 * 60); 
    if (diffHours < 24) {
        return postDate.getHours() + "h";
    } else {
        const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
        
        if (postDate.getFullYear() !== now.getFullYear()) {
            options.year = "numeric"; 
        }

        return postDate.toLocaleDateString("fr-FR", options);
    }
};

export default function LikeArea({ token }: { token: string | null }) {
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
            throw new Error("Erreur lors de la récupération des likes.");
        }
        return response.json();
    };

    const { data, error, isLoading } = useSWR(token ? `/api/like/likedPosts` : null, fetcher);

    if (isLoading) return <p>Chargement des likes...</p>;
    if (error) return <p>Erreur lors du chargement des likes.</p>;
    if (!data || data.length === 0) return <p>Aucun like trouvé.</p>;

    return (
        <div id="twist-area">
            {data.map((post: any) => (
                <div key={post.id} className="post-box">
                    <div className="post-header">
                        <strong>@{post.username}</strong>
                        <span className="post-date">{formatDate(post.created_at)}</span>
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
                </div>
            ))}
        </div>
    );
}
