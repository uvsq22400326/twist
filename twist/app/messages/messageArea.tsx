import useSWR from "swr";

export default function MessageArea({conversationId, userId, token} 
    : {conversationId : number, userId : number, token : string}) {

    console.log("userid = " + userId + " conversationId = " + conversationId + " token: " + token);

    const fetchMessages = (url: string, token: string) => fetch(url,{
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => 
        res.json().then((data) => data));
        
    
      //const fetcher = (url: string) => fetch(url).then((res) => res.json().then((data) => data.content));
      //const { data, error, isLoading } = useSWR(`/api/commentaire/afficher/${postid}`, fetcher);
      
      const { data : messagesData, isLoading: messagesLoading, error : messagesError } = useSWR(
        conversationId && ( token && (token != undefined)) 
            ? "/api/messages/" + conversationId + "/" + token : null,
        fetchMessages, { refreshInterval: 200 });
    
      if (messagesLoading) {
        return <p>Chargement des messages en cours...</p>
      }
      if (messagesError) {
        return <p>Erreur lors du chargement des messages</p>
      }
      //console.log(messagesData);
    return (
        <div className="chat-messages">
              {[...messagesData.content].reverse().map((msg) => (
                <div key={msg.id ?? `temp-${Date.now()}-${Math.random()}`} className={`message ${msg.sender_id === userId ? "sent" : "received"}`}>
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
            </div>
    )
}