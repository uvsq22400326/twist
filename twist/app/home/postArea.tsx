"use client";

import useSWR from "swr";
import "./home.css";

const like = async (msg_id, token) => {
    console.log('msg_id = ' + msg_id);
    await fetch("/api/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Msg_id: msg_id
        },
        body: JSON.stringify({ msg_id }),
    });
};

const follow = async (user2, token) => {
    await fetch("/api/auth/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ToFollow: user2,
        },
        body: JSON.stringify({ user2 }),
    });
};

export default function PostArea({ token }: { token: string }) {
    const fetcher = (url) => fetch(url).then(res => res.json().then((_res) => _res.content));
    
    const { data, error, isLoading } = useSWR("/api/home/posts", fetcher);

    if (isLoading) return (<div><p>Chargement des messages...</p></div>);
    if (error) return (<div><p>Erreur lors du chargement</p></div>);

    console.log("Données reçues dans PostArea :", JSON.stringify(data, null, 2));

    return (
      <div id="post-container">
        <h1>Twists</h1>
        {data?.map((post, i) => (
            <div className="post-box" key={i}>
                <p>{post.email}</p>
                <p>{post.content}</p>

                {/* Vérifier si media_url est bien présent */}
                {post.media_url && (
  post.media_url.includes("video") ? (
    <video controls width="400">
      <source src={post.media_url} type="video/mp4" />
      <source src={post.media_url} type="video/webm" />
      <source src={post.media_url} type="video/ogg" />
      Votre navigateur ne supporte pas la lecture de cette vidéo.
    </video>
  ) : (
    <img 
      src={post.media_url} 
      alt="Uploaded media" 
      width="250" 
      style={{ maxWidth: "100%", display: "block" }} 
    />
  )
)}



                <button onClick={() => like(post.id, token)}>
                  👍{post.like_count}
                </button>
                <p>{post.created_at}</p>
                <button onClick={() => follow(post.user_id, token)}>
                    <p>Follow</p>
                </button>
            </div>
        ))}
      </div>
    );
}
