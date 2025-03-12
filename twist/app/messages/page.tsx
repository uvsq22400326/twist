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
  participantEmail: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newChatEmail, setNewChatEmail] = useState("");
  const [showNewChatPopup, setShowNewChatPopup] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null); 

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


  const selectConversation = async (conversationId: number, participantEmail: string) => {
    if (!conversationId) return;
    setSelectedConversation(conversationId);
    setSelectedUserEmail(participantEmail);
    setShowNewChatPopup(false); 

    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });

      const data = await res.json();
      if (res.ok && data.messages) {
        setMessages(data.messages.length > 0 ? data.messages : []);


        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des messages :", error);
    }
  };


  const openNewChatPopup = () => {
    setShowNewChatPopup(true);
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
        setMessages([
          ...messages,
          {
            id: Date.now(),
            sender_id: userId!,
            content: newMessage || "",
            media_url: data.mediaUrl || null,
            created_at: "" + Date.now(),
          },
        ]);
        setNewMessage("");
        setSelectedFile(null);
        setPreviewUrl(null);


        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        console.error("Erreur serveur :", data.error);
      }
    } catch (error) {
      console.error("Erreur d'envoi :", error);
    }
  };
  const startConversation = async () => {
    if (!newChatEmail.trim()) return;
  
    try {
      const token = sessionStorage.getItem("token");
  

      const existingConv = conversations.find(conv => conv.participantEmail === newChatEmail);
  
      if (existingConv) {
        selectConversation(existingConv.id, newChatEmail);
      } else {
        const res = await fetch("/api/messages/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: newChatEmail }),
        });
  
        const data = await res.json();
        console.log("Réponse API :", data);
  
        if (res.ok && data.conversationId) {
          selectConversation(data.conversationId, newChatEmail);
        } else {
          console.error("Erreur lors de la création de la conversation :", data);
        }
      }
  
      setShowNewChatPopup(false);
      setNewChatEmail("");
  
    } catch (error) {
      console.error("Erreur lors de la requête API :", error);
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
          <h2>Messages</h2>
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
            <div key={conv.id} className="conversation-item" onClick={() => selectConversation(conv.id, conv.participantEmail)}>
              <p className="conv-name">{conv.participantEmail || "Utilisateur inconnu"}</p>
            </div>
          ))
        )}
      </div>

      <div className="chat-panel">
        {selectedConversation ? (
          <>
            <div className="chat-messages">
              {messages.map((msg) => (
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
          conversations.length === 0 && (
            <div className="welcome-message">
              <h2>Bienvenue dans ta messagerie !</h2>
              <p>Ici, c'est que du privé : envoie ton premier message et commence la discussion en toute simplicité.</p>
              <button className="new-message-btn" onClick={openNewChatPopup}>Nouveau message</button>
            </div>
          )
        )}
      </div>
      {/*machin popup nouv conv*/}
      {showNewChatPopup && (
        <div className="new-chat-popup">
          <div className="popup-content">
            <div className="popup-header">
              <button className="close-popup" onClick={() => setShowNewChatPopup(false)}>✕</button>
              <h2 className="popup-title">Nouveau message</h2>
            </div>
            <input type="text" placeholder="Rechercher un email..." value={newChatEmail} onChange={(e) => setNewChatEmail(e.target.value)} />
            <button onClick={startConversation}>Envoyer un message</button>
            </div>
        </div>
      )}
    </div>
  );
}
