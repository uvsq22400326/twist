"use client";

import { useState } from "react";
import React from "react";
import "./profil.css";

interface PostAreaProps {
  posts: any[];
  likes: any[];
  showLikes?: boolean;
}

export default function PostArea({ posts, likes, showLikes = false }: PostAreaProps) {
  const [showMenu, setShowMenu] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const displayedPosts = showLikes ? likes : posts;

  if (!displayedPosts || displayedPosts.length === 0) return <p>Aucun post trouvé.</p>;

  const formatDate = (dateString: string) => {
    const postDate = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - postDate.getTime();

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) return `${diffSeconds}s`;
    if (diffMinutes < 60) return `${diffMinutes}min`;
    if (diffHours < 24) return `${diffHours}h`;
    return postDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <div id="twist-area">
      {displayedPosts.map((post: any) => (
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
              </video>
            ) : (
              <img src={post.media_url} alt="Image postée" />
            ))}

        </div>
      ))}
    </div>
  );
}
