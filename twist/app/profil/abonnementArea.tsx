import useSWR from "swr";

import "./profil.css"
import { useEffect } from "react";
import React from "react";

export default function AbonnementArea(token: string) {
    console.log("Profile abonnementArea token = " + token);
    const fetcher = async (url: string, token : string) => fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Ajouter le token dans entete
        }
      }).then(res => {
        let r = res.json().then((_res) => {
            let rows = _res.content;
           return rows;
        });
        return r;
      });
    
      const { data, error, isLoading } = useSWR("/api/profil/abonnements/" + token, 
        (url : string, token : string) => fetcher(url, token));
    if (isLoading) return (<div>
        <p>Chargement des abonnements...</p>
    </div>)
    if (error) return (<div>
        <p>Erreur</p>
    </div>)
    console.log('data = ' + data);
    return (
      <div id="abonnement-container">
        <h2>Abonnements</h2>
        {[...Array(data.length)].map((_, i) => (
            <div className="post-box" key={i}>
                <p>{data[i].email}</p>
            </div>
        ))}
      </div>);
}