"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./profil.css";
import "../grid.css";
import PostArea from "./postArea";
import AbonnementArea from "./abonnementArea";
import FollowerArea from "./followerArea";
import React from "react";

export default function Profil() {
    const router = useRouter();
    const [_token, set_Token] = useState<string | null>(null);
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [bio, setBio] = useState("Aucune bio renseignée.");
    const [followers, setFollowers] = useState(0);
    const [following, setFollowing] = useState(0);
    
    const [editMode, setEditMode] = useState(false); // État pour activer l'édition
    const [newBio, setNewBio] = useState(""); // Contenu temporaire de la nouvelle bio

    useEffect(() => {
        const token = window.sessionStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }
        set_Token(token);

        fetch("/api/profil/info", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
        .then(res => res.json())
        .then(data => {
            if (data.profilePic) setProfilePic(data.profilePic);
            if (data.bio) setBio(data.bio);
            setFollowing(data.following);
            setFollowers(data.followers);
        });
    }, [router]);

    // Fonction pour mettre à jour la bio
    const handleUpdateBio = async () => {
        if (!newBio.trim()) return; // Évite les espaces vides

        const response = await fetch("/api/profil/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${_token}`,
            },
            body: JSON.stringify({ bio: newBio }),
        });

        const data = await response.json();
        if (response.ok) {
            setBio(newBio); // Met à jour la bio dans l'affichage
            setEditMode(false); // Désactive le mode édition
        } else {
            console.error("Erreur de mise à jour :", data.error);
        }
    };

    return (
        <div className="profile-container">
            <div id='profile_img_box' style={{
                backgroundImage: `url(${profilePic || "/icons/default-profile.png"})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}></div>

            <h2>Bio</h2>
            {editMode ? (
                <div className="bio-edit">
                    <textarea 
                        value={newBio} 
                        onChange={(e) => setNewBio(e.target.value)} 
                        placeholder="Entrez votre bio..."
                    />
                    <button onClick={handleUpdateBio}>Enregistrer</button>
                    <button onClick={() => setEditMode(false)}>Annuler</button>
                </div>
            ) : (
                <p onClick={() => {
                    setNewBio(bio);
                    setEditMode(true);
                }}>{bio}</p>
            )}

            <div className="follow-info">
                <p><strong>{followers}</strong> Followers</p>
                <p><strong>{following}</strong> Abonnements</p>
            </div>

            <div className='row'>
                <div id='mes_posts_container' className='col-4'>
                    <h1>Mes posts</h1>
                    <PostArea token={_token} />
                </div>
            </div>  
        </div>
    );
}
