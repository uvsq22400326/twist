"use client";
import React, { useState } from "react";

export default function CommentaireInput({ token, postid }: { token: string; postid: number }) {
    const [commContent, setCommContent] = useState("");

    return (
        <div>
            <input 
                type="text"
                className="comment-input" 
                placeholder="Ne sois pas méchant stp..."
                value={commContent}
                onChange={(e) => setCommContent(e.target.value)}
                required
            />
            <button 
                className="comment-submit" 
                onClick={() => sendComment(postid, commContent, token)}
            >
                Commenter
            </button>
        </div>
    );
}


export async function sendComment(postid: number, commContent: string, token: string) {
    if (!commContent.trim()) return; 
    const response = await fetch("/api/commentaire/publier", {
        method: "POST",
        body: JSON.stringify({ content: commContent, postid }),
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });

    const respJson = await response.json();
    if (response.status == 200) {
        alert("Commentaire publié");
    } else {
        alert(respJson.error);
    }
}

