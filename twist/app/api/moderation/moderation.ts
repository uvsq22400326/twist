import { encodeBase64 } from "bcryptjs";
import { NextResponse } from "next/server";
import { moderationImage } from "./moderationImage";

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
            }).then(async (_resp) => {
                //file.
                const image = await file.arrayBuffer().then((b) => {
                    return Buffer.from(b).toString('base64');
                })
             /**   var base64 = await file.text().then((t) => {
                    return Buffer.from(t).toString('base64');
                }) */
            const prompt = "Le message " + "\"" + content + "\"" 
                 + " est-il insultant ou vulgaire ? Répondre uniquement soit 'oui' soit 'non'" ;
            //const prompt = "Répondre 'Oui' si le message " + "\"" + content + "\"" + " ou l'image peuvent paraître insultant, gore, vulgaire ou choquant. Répondre 'Non' sinon";
            console.log("prompt = " + prompt);
            
            //console.log("base64 = " + base64);
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
                                const modImage = await moderationImage(image);
                                if (modImage.status != 200) {
                                    return modImage;
                                }
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