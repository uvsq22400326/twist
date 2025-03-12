"use client";

import { useState } from "react";
import useSWR from "swr";
import React from "react";
import "./profil.css";

export default function PostArea({ token }: { token: string | null }) {
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

    const { data, error, isLoading } = useSWR(token ? `/api/profil/posts/${token}` : null, fetcher);

    if (isLoading) return <p>Chargement des posts...</p>;
    if (error) return <p>Erreur lors du chargement des posts.</p>;
    if (!data || !data.posts || data.posts.length === 0) return <p>Aucun post trouvé.</p>;

    return (
        <div id="twist-area">
            {data.posts.map((post: any) => (
                <div key={post.id} className="post-box">
                    <p><strong>@{post.username}</strong></p>
                    <p>{post.content}</p>
                    {post.media_url && <img src={post.media_url} alt="Post media" />}
                </div>
            ))}
        </div>
    );
}
