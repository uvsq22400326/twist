import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { verifyToken } from "../../../lib/auth";
import cloudinary from "../../../lib/cloudinary";

export async function POST(req: Request) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 401 });

        const decodedToken = verifyToken(token);
        const userId = decodedToken.id;

        const contentType = req.headers.get("content-type");

        let bio = null;
        let profilePicUrl = null;
        let removeProfilePic = false;

        if (contentType?.includes("multipart/form-data")) {
            const data = await req.formData();
            const file = data.get("file") as File | null;
            const newBio = data.get("bio") as string | null;
            removeProfilePic = data.get("removeProfilePic") === "true";

            if (newBio !== null) {
                bio = newBio;
            }

            if (file) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                console.log("Upload image Cloudinary...");

                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            resource_type: "image",
                            folder: "profile_pictures",
                            access_mode: "public",
                        },
                        (error, result) => {
                            if (error) {
                                console.error(" Erreur Cloudinary :", error);
                                reject(error);
                            } else {
                                console.log("Upload réussi :", result?.secure_url);
                                resolve(result);
                            }
                        }
                    );
                    stream.end(buffer);
                });

                profilePicUrl = (result as any).secure_url;

                const [userRows]: any = await pool.query("SELECT profilePic FROM users WHERE id = ?", [userId]);
                const oldProfilePic = userRows?.[0]?.profilePic;

                if (oldProfilePic && oldProfilePic.includes("cloudinary.com")) {
                    const publicId = oldProfilePic.split("/").pop()?.split(".")[0]; 
                    await cloudinary.uploader.destroy(`profile_pictures/${publicId}`);
                    console.log("Ancienne photo supprimée de Cloudinary");
                }
            }
        }

        if (removeProfilePic) {
            await pool.query("UPDATE users SET profilePic = NULL WHERE id = ?", [userId]);
        }

        if (bio !== null) {
            await pool.query("UPDATE users SET bio = ? WHERE id = ?", [bio, userId]);
        }
        if (profilePicUrl !== null) {
            await pool.query("UPDATE users SET profilePic = ? WHERE id = ?", [profilePicUrl, userId]);
        }

        console.log("Mise à jour réussie :", { bio, profilePicUrl });

        return NextResponse.json({ 
            message: "Mise à jour réussie", 
            bio, 
            profilePic: removeProfilePic ? null : profilePicUrl 
        }, { status: 200 });

    } catch (error) {
        console.error("Erreur serveur :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}


export async function DELETE(req: Request) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 401 });

        const decodedToken = verifyToken(token);
        const userId = decodedToken.id;

        const [rows]: any = await pool.query("SELECT profilePic FROM users WHERE id = ?", [userId]);
        const currentProfilePic = rows[0]?.profilePic;

        if (!currentProfilePic || currentProfilePic === "/default-profile.png") {
            return NextResponse.json({ error: "Aucune photo à supprimer" }, { status: 400 });
        }

        if (currentProfilePic.includes("cloudinary.com")) {
            const publicId = currentProfilePic.split("/").pop()?.split(".")[0]; // Récupère l'ID Cloudinary
            await cloudinary.uploader.destroy(`profile_pictures/${publicId}`);
        }

        await pool.query("UPDATE users SET profilePic = ? WHERE id = ?", ["/default-profile.png", userId]);

        return NextResponse.json({ 
            message: "Photo de profil supprimée avec succès", 
            profilePic: "/default-profile.png" 
        }, { status: 200 });

    } catch (error) {
        console.error("Erreur serveur :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
