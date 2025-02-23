"use client";

import useSWR from "swr";

import "./home.css"

const like = async (msg_id: string, token: string) => {
    console.log('msg_id = ' + msg_id);
    const response = await fetch("/api/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Ajouter le token dans entete
          Msg_id: msg_id
        },
        body: JSON.stringify({ msg_id }), // Id Message
    });
}

const follow = async (user2: string, token: string) => {
    const response = await fetch("/api/auth/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Ajouter le token dans entete
          ToFollow: user2,
        },
        body: JSON.stringify({ user2 }), // Utilisateur à suivre
    });
}

export default function PostArea(token : string) {
    //const token = sessionStorage.getItem("token");
    const fetcher = (url: string) => fetch(url).then(res => {
        let r = res.json().then((_res) => {
            let rows = _res.content;            
           return rows;
        });
        return r;
      });
    
    const { data, error, isLoading} = useSWR("/api/home/posts", fetcher);
    if (isLoading) return (<div>
        <p>Chargement des messages...</p>
    </div>)
    if (error) return (<div>
        <p>Erreur</p>
    </div>)
    console.log('data = ' + data[0].id);
    return (
      <div id="post-container">
        <h1>Twists</h1>
        {[...Array(data.length)].map((_, i) => (
            <div className="post-box" key={i}>
            <p>{data[i].email}</p>
            <p>{data[i].content}</p>
            <button onClick={() => {like(data[i].id, token)}}>
              👍{data[i].like_count}
            </button>
            <p>{data.created_at}</p>
            <button onClick={() => {follow(data[i].user_id, token)}}>
                <p>Follow</p>
            </button>
        </div>
        ))}
      </div>);
}