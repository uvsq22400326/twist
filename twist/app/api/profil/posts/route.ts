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
        // On charge les 20 twists les plus récents.
        const [rows, fields] = await pool.query(
          "SELECT p.id, p.user_id, p.content, p.like_count, p.created_at, u.email " 
          + " from posts p, users u where p.user_id = " 
          + userId + " and p.user_id = u.id "
          + " order by p.id desc limit 20"
        );
        fields.forEach((field) => {
            console.log('field: ' + field.name);
        })
        //console.log(rows);
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