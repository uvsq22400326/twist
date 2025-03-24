import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { verifyToken } from "../../../../lib/auth";

export async function GET(request: Request,
    { params }: { params: Promise<{ userid: string }> }
) {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
        return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }
    const decodedToken = verifyToken(token);
    const userId = decodedToken.id;
    try {
        const [rows, fields] = await pool.query(
          "SELECT p.id, p.user_id, p.content, p.like_count, p.created_at, u.email " 
          + " from posts p, users u where p.user_id = " 
          + userId + " and p.user_id = u.id "
          + " order by p.id desc limit 20"
        );
        fields.forEach((field) => {
            console.log('field: ' + field.name);
        })
        return NextResponse.json(
          { message: "Twists retrouvés avec succès",
            content: rows
           },          
          { status: 200 }
        );
      } catch (error) {
        console.error("Erreur dans le serveur : ", error); // Log l'erreur
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
      }
      
}

export async function DELETE(request: Request) {
  try {
      const token = request.headers.get("Authorization")?.split(" ")[1];
      if (!token) {
          return NextResponse.json({ error: "Token manquant" }, { status: 401 });
      }

      const decodedToken = verifyToken(token);
      const userId = decodedToken.id; 

      const { searchParams } = new URL(request.url);
      const postId = searchParams.get("postId");

      if (!postId) {
          return NextResponse.json({ error: "ID du post manquant" }, { status: 400 });
      }

      const [post] = await pool.query("SELECT user_id FROM posts WHERE id = ?", [postId]);

      if ((post as any[]).length === 0 || (post as any)[0].user_id !== userId) {
          return NextResponse.json({ error: "Post introuvable ou non autorisé" }, { status: 403 });
      }

      await pool.query("DELETE FROM posts WHERE id = ?", [postId]);

      return NextResponse.json({ message: "Post supprimé avec succès" }, { status: 200 });
  } catch (error) {
      console.error("Erreur lors de la suppression du post :", error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}