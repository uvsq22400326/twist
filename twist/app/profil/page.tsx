"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./profil.css";
import "../grid.css";
import PostArea from "./postArea";
import React from "react";

interface User {
    id: number;
    username: string;
    profilePic: string | null;
}

export default function Profil() {
    const router = useRouter();
    const [_token, set_Token] = useState<string | null>(null);
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [bio, setBio] = useState("Aucune bio renseignée.");
    const [followers, setFollowers] = useState(0);
    const [following, setFollowing] = useState(0);

    // États pour stocker la liste des abonnés et abonnements
    const [followersList, setFollowersList] = useState<User[]>([]);
    const [followingList, setFollowingList] = useState<User[]>([]);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);

    const [editMode, setEditMode] = useState(false);
    const [newBio, setNewBio] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Fonction pour gérer le choix d'une nouvelle image
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
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
                setProfilePic(data.profilePic);
                setPreviewUrl(null);
                setSelectedFile(null);
            } else {
                alert("Erreur : " + data.error);
            }
        } catch (error) {
            console.error("Erreur serveur :", error);
        }
    };

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
                setBio(newBio);
                setEditMode(false);
            } else {
                alert("Erreur : " + data.error);
            }
        } catch (error) {
            console.error("Erreur serveur :", error);
            alert("Erreur serveur");
        }
    };

    // Récupération des informations de l'utilisateur
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

    // Fonction pour récupérer la liste des abonnés
    const fetchFollowers = async () => {
        if (!_token) return;

        try {
            const response = await fetch("/api/profil/followers", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${_token}`,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setFollowersList(data.followers || []);
                setShowFollowers(true);
            }
        } catch (error) {
            console.error("Erreur récupération followers :", error);
        }
    };

    // Fonction pour récupérer la liste des abonnements
    const fetchFollowing = async () => {
        if (!_token) return;

        try {
            const response = await fetch("/api/profil/abonnements", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${_token}`,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setFollowingList(data.following || []);
                setShowFollowing(true);
            }
        } catch (error) {
            console.error("Erreur récupération abonnements :", error);
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
                <p onClick={fetchFollowers} className="clickable"><strong>{followers ?? "?"}</strong> abonnés</p>
                <p onClick={fetchFollowing} className="clickable"><strong>{following ?? "?"}</strong> abonnements</p>
            </div>

            {/* Section des posts */}
            <div className='row'>
                <div id='mes_posts_container' className='col-4'>
                    <h1>Mes posts</h1>
                    <PostArea token={_token} />
                </div>
            </div>  

            {/* Modales pour afficher les abonnés et abonnements */}
            {showFollowers && (
                <div className="modal">
                    <h3>Abonnés</h3>
                    <ul>
                        {followersList.map((user) => (
                            <li key={user.id} className="user-item">
                                <img src={user.profilePic || "/icons/default-profile.png"} alt="Profil" className="profile-pic" />
                                @{user.username}
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => setShowFollowers(false)}>Fermer</button>
                </div>
            )}

            {showFollowing && (
                <div className="modal">
                    <h3>Abonnements</h3>
                    <ul>
                        {followingList.map((user) => (
                            <li key={user.id} className="user-item">
                                <img src={user.profilePic || "/icons/default-profile.png"} alt="Profil" className="profile-pic" />
                                @{user.username}
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => setShowFollowing(false)}>Fermer</button>
                </div>
            )}
        </div>
    );
}