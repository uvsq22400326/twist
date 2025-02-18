import useSWR from "swr";

import "./profil.css"

export default function AbonnementArea() {
    const token = sessionStorage.getItem("token");
    const fetcher = (url) => fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Ajouter le token dans entete
        }
      }).then(res => {
        let r = res.json().then((_res) => {
            let rows = _res.content;
            console.log('rows = ' + rows);
           return rows;
        });
        return r;
      });
    
    const { data, error, isLoading} = useSWR("/api/profil/abonnements", fetcher);
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