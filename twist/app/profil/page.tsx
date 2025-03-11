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
    
    const [editMode, setEditMode] = useState(false);
    const [newBio, setNewBio] = useState("");

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

    const handleUpdateBio = async () => {
        if (!newBio.trim()) {
            alert("La bio ne peut pas être vide !");
            return;
        }

        if (!_token) {
            console.error("Token manquant !");
            return;
        }

        console.log("📝 Envoi de la bio :", newBio);

        try {
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
                console.log("✅ Bio mise à jour avec succès :", data);
                setBio(newBio);
                setEditMode(false);
            } else {
                console.error("❌ Erreur lors de la mise à jour :", data.error);
                alert("Erreur : " + data.error);
            }
        } catch (error) {
            console.error("❌ Erreur serveur :", error);
            alert("Erreur serveur");
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
