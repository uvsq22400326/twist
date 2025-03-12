import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { verifyToken } from "../../../../lib/auth";
import cloudinary from "../../../../lib/cloudinary";

export async function POST(req: Request) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 401 });

        const decodedToken = verifyToken(token);
        const userId = decodedToken.id;

        const contentType = req.headers.get("content-type");

        let bio = null;
        let profilePicUrl = null;

        // 🔹 Si c'est une requête JSON, on met à jour la bio
        if (contentType?.includes("application/json")) {
            const { bio: newBio } = await req.json();
            if (newBio) {
                bio = newBio;
            }
        } 
        
        // 🔹 Si c'est une requête FormData, on met à jour l'image de profil
        else if (contentType?.includes("multipart/form-data")) {
            const data = await req.formData();
            const file = data.get("file") as File | null;

            if (file) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                console.log("🔄 Upload sur Cloudinary en cours...");

                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            resource_type: "image",
                            folder: "profile_pictures",
                            access_mode: "public",
                        },
                        (error, result) => {
                            if (error) {
                                console.error("❌ Erreur Cloudinary :", error);
                                reject(error);
                            } else {
                                console.log("✅ Upload réussi :", result?.secure_url);
                                resolve(result);
                            }
                        }
                    );
                    stream.end(buffer);
                });

                profilePicUrl = (result as any).secure_url;
            }
        } else {
            return NextResponse.json({ error: "Type de contenu invalide" }, { status: 400 });
        }

        // ✅ Mise à jour de la base de données
        if (bio !== null) {
            await pool.query("UPDATE users SET bio = ? WHERE id = ?", [bio, userId]);
        }
        if (profilePicUrl !== null) {
            await pool.query("UPDATE users SET profilePic = ? WHERE id = ?", [profilePicUrl, userId]);
        }

        console.log("✅ Mise à jour réussie :", { bio, profilePicUrl });

        return NextResponse.json({ 
            message: "Mise à jour réussie", 
            bio, 
            profilePic: profilePicUrl 
        }, { status: 200 });

    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}