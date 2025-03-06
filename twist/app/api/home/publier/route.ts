import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { verifyToken } from "../../../../lib/auth";
import cloudinary from "../../../../lib/cloudinary";

export async function POST(req: Request) {
  console.log(" Requête reçue pour publier un post");

  const data = await req.formData();
  const content = data.get("content") as string;
  const file = data.get("file") as File;
  const token = req.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    console.log("Token manquant !");
    return NextResponse.json({ error: "Token manquant" }, { status: 401 });
  }

  try {
    const decodedToken = verifyToken(token);

    if (!decodedToken) {
      console.log(" Token invalide !");
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const userId = decodedToken.id;

    if (!content) {
      console.log("Le contenu du post est vide !");
      return NextResponse.json({ error: "Le contenu du post est requis" }, { status: 400 });
    }

    let fileUrl = null;

    // Si un fichier est fourni, on l'upload sur Cloudinary
    if (file) {
      
      const fileType = file.type; // Obtenir le type du fichier
    
      // Types autorisés
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "video/mp4", "video/webm", "video/ogg"];
    
      // Vérification du type de fichier
      if (!allowedTypes.includes(fileType)) {
        console.log("Type de fichier interdit :", fileType);
        return NextResponse.json({ error: "Seuls les fichiers image et vidéo sont autorisés !" }, { status: 400 });
      }
    
      console.log("Fichier accepté :", fileType);
    
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const isVideo = fileType.startsWith("video/"); // Vérifier si c'est une vidéo

      try {
        console.log("Début de l'upload sur Cloudinary...");

        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { 
              resource_type: isVideo ? "video" : "image",
              folder: "twist",
              access_mode: "public",
              timeout: 120000 // Augmente le temps limite à 2 minutes
            },
            (error, result) => {
              if (error) {
                console.log(" Erreur d'upload Cloudinary :", error);
                reject(error);
              } else {
                console.log("Upload réussi :", result?.secure_url);
                resolve(result);
              }
            }
          );
        
          console.log("Envoi des données à Cloudinary...");
          stream.end(buffer);
        });
        

        fileUrl = (result as any).secure_url;
        console.log(" URL du fichier Cloudinary :", fileUrl);

      } catch (uploadError) {
        console.log("Échec de l'upload Cloudinary :", uploadError);
        return NextResponse.json({ error: "Échec de l'upload Cloudinary" }, { status: 500 });
      }
    }

    console.log("Insertion du post dans la base de données...");
    await pool.query(
      "INSERT INTO posts (user_id, content, media_url, like_count) VALUES (?, ?, ?, ?)",
      [userId, content, fileUrl, 0]
    );
    console.log("Post inséré avec succès !");

    return NextResponse.json(
      { message: "Post publié avec succès", mediaUrl: fileUrl },
      { status: 200 }
    );

  } catch (error) {
    console.error("Erreur serveur :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
