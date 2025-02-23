import useSWR from "swr";

import "./profil.css"

const like = async (msg_id: string, token: string | null) => {
    console.log('msg_id = ' + msg_id);
    const response = await fetch("/api/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Ajouter le token dans entete
          Msg_id: msg_id
        },
        body: JSON.stringify({ msg_id }), // Contenu du tweet
    });
}

export default function PostArea(token: string) {
    const fetcher = (url: string) => fetch(url, {
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
    
    const { data, error, isLoading} = useSWR("/api/profil/posts", fetcher);
    if (isLoading) return (<div>
        <p>Chargement des messages...</p>
    </div>)
    if (error) return (<div>
        <p>Erreur</p>
    </div>)
    console.log('data = ' + data);
    return (
      <div id="post-container">
        <h2>Twists</h2>
        {[...Array(data.length)].map((_, i) => (
            <div className="post-box" key={i}>
                <p>{data[i].email}</p>
                <p>{data[i].content}</p>
                <button onClick={() => {like(data[i].id, token)}}>
                  👍{data[i].like_count}
                </button>
                <p>{data.created_at}</p>
                <button>
                    <p>Follow</p>
                </button>
            </div>
        ))}
      </div>);
}