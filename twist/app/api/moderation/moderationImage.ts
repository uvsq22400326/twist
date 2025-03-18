import { NextResponse } from "next/server";

export async function moderationImage(image:string) {
    const prompt = "L'image est-elle complètement sûre ? Répondre par 'oui' ou 'non' puis détailler"
    const response = await fetch(
        "https://jealous-minne-twist-ollama-0544ea7b.koyeb.app/api/generate", {
            method: "POST",
            body: JSON.stringify({
                model: "llava", 
                prompt: prompt,
                images: [image],
                stream: false
            })
        }).then(async (resp : Response) => {
            const r = resp.json();
            const modrep = r.then((rjson) => {
                console.log("Moderation image : " + JSON.stringify(rjson))
                const err = rjson.error as string;
                if (err) {
                    return NextResponse.json({
                        error: err
                    }, {status: 501});
                } else {
                    const rstring = rjson.response as string;
                    const words = rstring.split(" ");
                        if (words.includes("non") || words.includes("Non") ||
                             words.includes("Non.") || words.includes("non,") || 
                             words.includes("Non,")) {
                                return NextResponse.json(
                                    { error: "L'image a été considérée comme inappropriée" },
                                    { status: 201 }
                                );    
                             } else {
                            return NextResponse.json(
                                { message: "Post accepté avec succès" },
                                { status: 200 }
                            );
                        }
                }
            });
            return modrep;
        });
        return response;
    }