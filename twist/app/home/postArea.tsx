"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import "./home.css";
import { verifyToken } from "../../lib/auth";
import React from "react";
import CommentaireInput from "../commentaire/comment";

interface Commentaire {
  id: number;
  content: string;
  username: string;
  postid: number;
}

const follow = async (user2: string, token: string, isFollowing: boolean) => {
  await fetch(`/api/auth/follow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ToFollow: user2,
    },
    body: JSON.stringify({ user2, isFollowing }),
  });
};

export default function PostArea(token: string) {
  console.log("postArea:  token = " + token);
  const [likedPosts, setLikedPosts] = useState<{ [key: string]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [key: string]: number }>({});
  const [following, setFollowing] = useState<{ [key: string]: boolean }>({});
  //const [comms, setComms] = useState<Commentaire[]>([]);
  const [commForId, setCommForId] = useState<number>(1);
  const [shouldPrintComm, setShouldPrintComm] = useState<boolean>(false);
  const userId = 1;

  // Fonction pour extraire l'ID utilisateur depuis le token
  const getUserIdFromToken = (token: string): string | null => {
    const decodedToken = verifyToken(token);
    const userId = decodedToken.id;
    return "" + userId;
  };

  useEffect(() => {
    const fetchInitialStates = async () => {
      try {
        // Fetch following state
        const followRes = await fetch("/api/auth/following", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const followData = await followRes.json();
        if (followRes.ok) {
          const followingState = followData.reduce(
            (acc: { [key: string]: boolean }, user: { id: string }) => {
              acc[user.id] = true;
              return acc;
            },
            {}
          );
          setFollowing(followingState);
        }

        // Fetch liked posts state
        const likeRes = await fetch("/api/like/likedPosts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const likeData = await likeRes.json();
        if (likeRes.ok) {
          const likedState = likeData.reduce(
            (acc: { [key: string]: boolean }, post: { id: string }) => {
              acc[post.id] = true;
              return acc;
            },
            {}
          );
          setLikedPosts(likedState);
        }
      } catch (error) {
        console.error("Error fetching initial states:", error);
      }
    };

    fetchInitialStates();
  }, [token]);

  const handleLike = async (
    postId: string,
    initialLikes: number,
    token: string
  ) => {
    const alreadyLiked = likedPosts[postId] || false;

    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !alreadyLiked,
    }));

    setLikeCounts((prev) => ({
      ...prev,
      [postId]: alreadyLiked
        ? (prev[postId] ?? initialLikes) - 1
        : (prev[postId] ?? initialLikes) + 1,
    }));

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleFollow = async (user2: string) => {
    const isFollowing = following[user2] || false;
    await follow(user2, token, isFollowing);
    setFollowing((prev) => ({
      ...prev,
      [user2]: !isFollowing,
    }));
  };

  const fetcher = (url: string) =>
    fetch(url).then((res) => res.json().then((data) => data.content));
  const { data, error, isLoading } = useSWR("/api/home/posts", fetcher);
  const commfetcher = (url: string, postid: string) =>
    fetch(url, {
      method: "GET",
      headers: { postid: postid },
    }).then((res) => res.json().then((data) => data.content));
  // Call API pour selectionner tous les commentaires relatifs au post
  const {
    data: commdata,
    error: commerror,
    isLoading: commloading,
  } = useSWR(
    data && shouldPrintComm ? "/api/commentaire/afficher/" + commForId : null,
    commfetcher
  );

  if (isLoading)
    return (
      <div>
        <p>Chargement des messages...</p>
      </div>
    );

  if (error) {
    return (
      <div>
        <p>Erreur lors du chargement</p>
      </div>
    );
  }

  if (!data || !data.length) {
    return (
      <div>
        <p>Aucun message trouvé.</p>
      </div>
    );
  }

  return (
    <div id="twist-area">
      {[...Array(data.length)].map((_, i) => (
        <div key={i} className="post-box">
          <button
            className="follow-button"
            onClick={() => handleFollow(data[i].user_id)}
            disabled={data[i].user_id === userId} // Empêche l'auto-follow
          >
            {following[data[i].user_id] ? "Unfollow" : "Follow"}
          </button>

          {/* Affichage du username au lieu de l'email */}
          <p>
            <strong>@{data[i].username || "Utilisateur"}</strong>
          </p>

          <p>{data[i].content}</p>

          {/* Affichage des médias */}
          {data[i].media_url &&
            (data[i].media_url.includes("video") ? (
              <video controls>
                <source src={data[i].media_url} type="video/mp4" />
                <source src={data[i].media_url} type="video/webm" />
                <source src={data[i].media_url} type="video/ogg" />
              </video>
            ) : (
              <img src={data[i].media_url} alt="Image postée" />
            ))}

          {/* Bouton Like */}
          <button
            className={`like-button ${likedPosts[data[i].id] ? "liked" : ""}`}
            onClick={() => handleLike(data[i].id, data[i].like_count, token)}
          >
            <svg className="heart-icon" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
            </svg>
            <span>{likeCounts[data[i].id] ?? data[i].like_count}</span>
          </button>
          {/* Champ pour commenter */}
          {CommentaireInput(token, data[i].id)}
          <button
            onClick={() => {
              setCommForId(data[i].id);
              setShouldPrintComm(true);
            }}
          >
            Afficher commentaires
          </button>
          <h3>Commentaires</h3>
          {!shouldPrintComm || commForId != data[i].id ? (
            <></>
          ) : commloading || !commdata ? (
            <p>Chargement</p>
          ) : (
            <div>
              {[...Array(commdata.length)].map((_, i) => (
                <div key={i}>
                  <h4>
                    {commdata[i].username} : {commdata[i].content}
                  </h4>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
