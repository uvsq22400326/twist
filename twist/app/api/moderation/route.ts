import { NextResponse } from "next/server";

export async function moderation(content: string, file: File) {

    const moderationPullModel = await fetch(
        "https://jealous-minne-twist-ollama-0544ea7b.koyeb.app/api/pull", {
            method: "POST",
            body: JSON.stringify({name: "llava"})
    }).then(async (resp : Response) => {
        console.log("pull model : " + resp.status);
        return resp;    
    }).then((_resp : Response) => {
        if (_resp.status != 200) {
            return NextResponse.json({
                error: "Le modèle de modération est en train d'être téléchargé. Veuillez " +
                    "réactualiser la page et réessayer de publier"
            }, {status: 500});
        }
        const reponseModel = 
            fetch("https://jealous-minne-twist-ollama-0544ea7b.koyeb.app/api/generate", {
                method: "POST",
                body: JSON.stringify({model: "llava", stream: false})
            }).then((_resp) => {
                console.log("Modèle chargé.");
                return _resp;
            }).then((_resp) => {
            const prompt = "Le message " + "\"" + content + "\"" + " est-il insultant, " 
                + "vulgaire ou choquant ? Répondre par oui ou non" ;
            console.log("prompt = " + prompt);
            const reponseFinale = fetch(
                "https://jealous-minne-twist-ollama-0544ea7b.koyeb.app/api/generate", {
                    method: "POST",
                    body: JSON.stringify({
                        model: "llava", 
                        prompt: prompt,
                        stream: false
                    })
                }).then(async (resp: Response) => {
                    // Prendre la reply en json et prendre le champ reponse.
                    const r = resp.json();
                    
                    const modrep = r.then(async (response) => {
                        console.log("json = " + JSON.stringify(response));
                        console.log("Réponse du modèle de modération : " + response.response);
                        
                        // Si resp contient une erreur, la renvoyer
                        const rerror = response.error as string;
                        if (rerror) {
                            if (rerror.includes("not found")) {
                                return NextResponse.json({
                                    error: "Téléchargement du modèle d'IA." 
                                        + "Veuillez réactualiser la page puis réessayer."
                                }, {status: 500});
                            }
                        }
                        const rstring = response.response as string;
                        const words = rstring.split(" ");
                        if (words.includes("non") || words.includes("Non") ||
                             words.includes("Non.") || words.includes("non,") || 
                             words.includes("Non,")) {
                                return NextResponse.json(
                                    { message: "Post accepté avec succès" },
                                    { status: 200 }
                                    );
                             }
                        else {
                            console.log("Le message  a été considéré comme inapproprié");
                            return NextResponse.json(
                                { error: "Le message  a été considéré comme inapproprié"},
                                { status: 201 }
                            
                            );
                        }
                    });
                    return modrep;
            });    
        return reponseFinale;  
    });
    return reponseModel;
    }).then((_resp) => {
        return _resp;   
    });
    return moderationPullModel;
}