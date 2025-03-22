"use client";

import { useState, useEffect } from "react";
import "./profil.css";

interface User {
    id: number;
    username: string;
    profilePic: string | null;
}

interface SuggestionsProps {
    userId: number;
    updateFollowingCount: (change: number) => void;

}

export default function Suggestions({userId, updateFollowingCount }: SuggestionsProps) {
    const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [followingUsers, setFollowingUsers] = useState<number[]>([]); 

    useEffect(() => {
        if (!userId) return;

        console.log(` Récupération des suggestions pour userId=${userId}...`);
        
        fetchSuggestions();
        
        fetchFollowingUsers();
    }, [userId]);

    const fetchSuggestions = () => {
        setLoading(true);
        fetch(`/api/suggestions?userId=${userId}`)
            .then((res) => res.json())
            .then((users) => {
                console.log("Suggestions API (reçues) :", users);
                if (Array.isArray(users) && users.length > 0) {
                    setSuggestedUsers(users);
                } else {
                    setSuggestedUsers([]);
                }
            })
            .catch((error) => console.error("Erreur récupération suggestions :", error))
            .finally(() => setLoading(false));
    };

    const fetchFollowingUsers = () => {
        const token = sessionStorage.getItem("token");

        fetch("/api/auth/following", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("Utilisateurs suivis :", data);
                if (Array.isArray(data)) {
                    setFollowingUsers(data.map((user: any) => user.id)); 
                }
            })
            .catch((error) => console.error("Erreur récupération abonnements :", error));
    };

    const handleFollow = async (userIdToFollow: number) => {
        if (!userId) return;
    
        const token = sessionStorage.getItem("token");
    
        try {
            const response = await fetch("/api/auth/follow", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "ToFollow": userIdToFollow.toString(),
                },
            });
    
            const data = await response.json();
            console.log(" Réponse Follow :", data);
    
            if (response.ok) {
                setFollowingUsers(prevFollowing =>
                    prevFollowing.includes(userIdToFollow)
                        ? prevFollowing.filter(id => id !== userIdToFollow) // Unfollow
                        : [...prevFollowing, userIdToFollow] // Follow
                );
    
                updateFollowingCount(followingUsers.includes(userIdToFollow) ? -1 : +1);
    
                fetchSuggestions();
            } else {
                alert("Erreur : " + data.error);
            }
        } catch (error) {
            console.error(" Erreur lors du suivi :", error);
        }
    };
    

    return (
        <div className="suggestions-box">
            <h3>Vous pourriez aimer</h3>
            {loading ? (
                <p>Chargement...</p>
            ) : suggestedUsers.length > 0 ? (
                suggestedUsers.map((user) => (
                    <div key={user.id} className="suggestion-item">
                        <img src={user.profilePic || "/default-profile.png"} alt="Profil" />
                        <div>
                            <strong>@{user.username}</strong>
                        </div>
                        <button 
    className={followingUsers.includes(user.id) ? "suggestion-unfollow-btn" : "suggestion-follow-btn"}
    onClick={() => handleFollow(user.id)}
>
    {followingUsers.includes(user.id) ? "Ne plus suivre" : "Suivre"}
</button>

                    </div>
                ))
            ) : null}
        </div>
    );
}
