"use client";
import React, { useState } from "react";

export default function CommentaireInput(token : string, postid: number) {
    var commContent = "";

    // Fait apparaître un input field sous le message
    // Ainsi qu'un boutton envoyer qui exécute sendComment
    return (
        <div>
            <input type="text" id={"commentButton" + postid}
            onChange={(e) => commContent = e.target.value}
            required>
            </input>
            <button onClick={() => sendComment(postid, commContent, token)}>
                Commenter
            </button>
        </div>
    )
}

export async function sendComment(postid: number, commContent: string, token: string) {
    //alert("post_id = " + postid + " commContent = " + commContent + " token = " + token);
    // Call API pour poster le commentaire
    const response = await fetch("/api/commentaire/publier", {
        method: "POST",
        body: JSON.stringify({
            content: commContent,
            postid: postid
        }),
        headers: { Authorization: `Bearer ${token}` },
    });
    const respJson = await response.json();
    if (response.status == 200) {
        alert("Commentaire publié");
    } else {
        alert(respJson.error);
    }
}