"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./profil.css";
import "../grid.css";
import PostArea from "./postArea";
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
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Fonction pour gérer le choix d'une nouvelle image
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // Affichage de l'aperçu
        }
    };

    // Fonction pour mettre à jour la photo de profil
    const handleUpdateProfilePicture = async () => {
        if (!selectedFile || !_token) {
            alert("Veuillez sélectionner une image !");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await fetch("/api/profil/update", {
                method: "POST",
                headers: { Authorization: `Bearer ${_token}` },
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setProfilePic(data.profilePic); // Mise à jour de l'affichage
                setPreviewUrl(null);
                setSelectedFile(null);
            } else {
                alert("Erreur : " + data.error);
            }
        } catch (error) {
            console.error("Erreur serveur :", error);
        }
    };

    // Récupération des informations de l'utilisateur (photo + bio + stats)
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
            {/* Image de profil */}
            <div id='profile_img_box' style={{
                backgroundImage: `url(${profilePic || "/icons/default-profile.png"})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}></div>

            {/* Édition de la bio */}
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

            {/* Affichage du compteur de followers / abonnements */}
            <div className="follow-info">
                <p><strong>{followers ?? "?"}</strong> abonnés</p>
                <p><strong>{following ?? "?"}</strong> abonnements</p>
            </div>

            {/* Section des posts */}
            <div className='row'>
                <div id='mes_posts_container' className='col-4'>
                    <h1>Mes posts</h1>
                    <PostArea token={_token} />
                </div>
            </div>  

            {/* Changer la photo de profil */}
            <div className="profile-picture-section">
                <label className="upload-icon">
                    <input type="file" accept="image/*" onChange={handleFileUpload} hidden />
                    <img src="/icons/image.png" alt="Upload" />
                </label>

                {previewUrl && (
                    <div className="preview-container">
                        <img src={previewUrl} alt="Preview" className="preview-media" />
                        <button className="remove-preview" onClick={() => setPreviewUrl(null)}>✕</button>
                        <button onClick={handleUpdateProfilePicture}>Enregistrer</button>
                    </div>
                )}
            </div>
        </div>
    );
}
