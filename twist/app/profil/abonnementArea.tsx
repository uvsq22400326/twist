import useSWR from "swr";
import "./profil.css";
import React from "react";

export default function AbonnementArea({ token }: { token: string }) {
    const fetcher = async (url: string) => fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }
    }).then(res => res.json());

    const { data, error, isLoading } = useSWR(token ? "/api/profil/abonnements" : null, fetcher);

    console.log("📩 Réponse API abonnements:", data); // Debug

    if (isLoading) return <p>Chargement...</p>;
    if (error) return <p>Erreur lors du chargement</p>;

    return (
        <div id="abonnement-container">
            <h2>Abonnements</h2>
            {data?.length > 0 ? (
                data.map((user: any) => (
                    <div className="post-box" key={user.id}>
                        <p>@{user.username}</p>
                    </div>
                ))
            ) : (
                <p>Aucun abonnement trouvé.</p>
            )}
        </div>
    );
}
