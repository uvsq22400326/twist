"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import "./messages.css";
import React from "react";

interface Message {
  id: number;
  sender_id: number;
  content: string;
  created_at: string;
  media_url?: string;
}

interface Conversation {
  id: number;
  participantUsername: string;
  username?: string; // Add the username property
  profilePic?: string; // Add the profilePic property
}

export default function MessagesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [selectedUserUsername, setSelectedUserUsername] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newChatUsername, setNewChatUsername] = useState("");
  const [showNewChatPopup, setShowNewChatPopup] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null); 
  const [searchResults, setSearchResults] = useState<Conversation[]>([]);
  const [selectedUserProfilePic, setSelectedUserProfilePic] = useState<string>("/default-profile.png");



  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setUserId(decodedToken.id);
      sessionStorage.setItem("userId", decodedToken.id);
    } catch (error) {
      console.error("Erreur de décodage du token :", error);
      router.push("/login");
    }
  }, [router]);


  useEffect(() => {
    if (!userId) return;

    const token = sessionStorage.getItem("token");

    fetch("/api/messages/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setConversations(data.conversations))
      .catch((err) => console.error("Erreur de fetch :", err));
  }, [userId]);


  const selectConversation = async (conversationId: number, participantUsername: string) => {
    if (!conversationId) return;
    setSelectedConversation(conversationId);
    setSelectedUserUsername(participantUsername);
    
  setSearchResults([]); 
  setShowNewChatPopup(false); 

    try {
        const res = await fetch(`/api/messages/${conversationId}`, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        });

        const data = await res.json();
        if (res.ok && data.messages) {
            setMessages(data.messages.length > 0 ? data.messages : []);
            setSelectedUserProfilePic(data.profilePic || "/default-profile.png"); 
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des messages :", error);
    }
};


  const openNewChatPopup = () => {
    setShowNewChatPopup(true);
  };


  const closeNewChatPopup = () => {
    setSearchResults([]); 

    setShowNewChatPopup(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    const formData = new FormData();
    if (newMessage.trim()) formData.append("content", newMessage);
    if (selectedFile) formData.append("file", selectedFile);

    try {
        const res = await fetch(`/api/messages/${selectedConversation}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
            body: formData,
        });

        const data = await res.json();

        if (res.ok) {
            // ✅ Ajouter le message dans la conversation
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: Date.now(),
                    sender_id: userId!,
                    content: newMessage || "",
                    media_url: data.mediaUrl || null,
                    created_at: "" + Date.now(),
                },
            ]);

            // ✅ Vérifier si la conversation existe déjà dans la liste
            const conversationExists = conversations.some(
                (conv) => conv.id === selectedConversation
            );

            if (!conversationExists) {
                // ✅ Ajouter la nouvelle conversation à gauche (sans recharger)
                setConversations((prevConversations) => [
                    ...prevConversations,
                    {
                        id: selectedConversation!,
                        participantUsername: selectedUserUsername!,
                        profilePic: selectedUserProfilePic, // Ajoute la photo de profil
                    },
                ]);
            }

            setNewMessage("");
            setSelectedFile(null);
            setPreviewUrl(null);
        } else {
            console.error("Erreur serveur :", data.error);
        }
    } catch (error) {
        console.error("Erreur d'envoi :", error);
    }
};


  const startConversation = async () => {
    if (!newChatUsername.trim()) return;

    try {
        const token = sessionStorage.getItem("token");

        // 🔍 Rechercher les utilisateurs qui correspondent à la saisie
        const res = await fetch(`/api/messages/search?username=${newChatUsername}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok && data.users.length > 0) {
            setSearchResults(data.users); // 📌 Affiche les suggestions
        } else {
            setSearchResults([]);
            console.error("Aucun utilisateur trouvé");
        }

    } catch (error) {
        console.error("Erreur lors de la recherche :", error);
    }
};

  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };
  
  
  return (
    <div className="messages-container">
      <div className="conversations-panel">
        <div className="header">
        <h2>
  <a href="/messages" className="messages-link">
    Messages
  </a>
</h2>

          <img
            src="/icons/messages.png"
            alt="Nouveau message"
            className="new-message-icon"
            onClick={openNewChatPopup} 
          />
        </div>

        {conversations.length === 0 ? (
          <p className="empty-state">Aucune conversation disponible.</p>
        ) : (
          conversations.map((conv) => (
            <div key={conv.id} className="conversation-item" onClick={() => selectConversation(conv.id, conv.participantUsername)}>
              <img 
      src={conv.profilePic} 
      alt="Photo de profil" 
      className="conversation-profile-pic" 
    />
              <p className="conv-name">{conv.participantUsername || "Utilisateur inconnu"}</p>
            </div>
          ))
        )}
      </div>

      <div className="chat-panel">
        {selectedConversation ? (
          <>
          <div className="chat-header">
          <img src={selectedUserProfilePic} alt="Photo de profil" className="profile-pic" />

    <span className="chat-username">{selectedUserUsername}</span>
</div>
            <div className="chat-messages">
              {[...messages].reverse().map((msg) => (
                <div key={msg.id} className={`message ${msg.sender_id === userId ? "sent" : "received"}`}>
                  {msg.media_url ? (
                    <>
                      {msg.media_url.includes("video") ? (
                        <video src={msg.media_url} controls className="chat-media"></video>
                      ) : (
                        <img src={msg.media_url} alt="media" className="chat-media" />
                      )}
                      {msg.content && <p className="media-text">{msg.content}</p>} 
                    </>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>

            <div className="chat-input">
            {previewUrl && (
  <div className="preview-container">
    {selectedFile?.type.startsWith("video") ? (
      <video src={previewUrl} controls className="preview-media"></video>
    ) : (
      <img src={previewUrl} alt="Preview" className="preview-media" />
    )}
    <button className="remove-preview" onClick={() => setPreviewUrl(null)}>✕</button>
  </div>
)}


              <input type="text" placeholder="Écrire un message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
              <label className="upload-icon">
                <input type="file" accept="image/*,video/*"onChange={handleFileUpload} hidden />
                <img src="/icons/image.png" alt="Upload" />
              </label>
              <button onClick={sendMessage}>Envoyer</button>
            </div>
          </>
        ) : (
          
            <div className="welcome-message">
              <h2>Aucun message sélectionné</h2>
              <p>Tu veux parler à quelqu'un? Raconter ta vie même tout le monde s'en fou? </p>
              <p> Tu es au bon endroit mon ami.
              </p>
              <button className="new-message-btn" onClick={openNewChatPopup}>Nouveau message</button>
            </div>
          
        )}
      </div>
      {/*machin popup nouv conv*/}
      {showNewChatPopup && (
        <div className="new-chat-popup">
          <div className="popup-content">
            <div className="popup-header">
            <button className="close-popup" onClick={closeNewChatPopup}>✕</button>
            <h2 className="popup-title">Nouveau message</h2>
            </div>
            <input type="text" placeholder="Tu parles trop..." value={newChatUsername} onChange={(e) => setNewChatUsername(e.target.value)} />
            
{/* 🔥 Suggestions qui s'affichent sous l'input */}
{searchResults.length > 0 && (
  <div className="search-results">
    {searchResults.map((user) => (
      <div 
        key={user.id} 
        className="search-user" 
        onClick={() => user.username && selectConversation(user.id, user.username)}
      >
        {user.username}
      </div>
    ))}
  </div>
)}
            <button onClick={startConversation}>Envoyer un message</button>
            </div>
        </div>
      )}
    </div>
  );
}
