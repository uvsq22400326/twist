"use client";
import React, { useState } from "react";

export default function CommentaireInput(postid) {
    var commContent = "";
    // Fait apparaître un input field sous le message
    // Ainsi qu'un boutton envoyer qui exécute sendComment

    //onChange={(e) => {setCommContent(e.target.value);}}
    return (
        <div>
            <input type="text" id={"commentButton" + postid}
            onChange={(e) => commContent = e.target.value}
            required>
            </input>
            <button onClick={() => sendComment(postid, commContent)}>
                Commenter
            </button>
        </div>
    )
}

export function sendComment(postid, commContent) {
    alert("post_id = " + postid + " commContent = " + commContent);
}