import { NextResponse } from "next/server";
import pool from "../../../../../lib/db";
import { verifyToken } from "../../../../../lib/auth";

export async function GET(request: Request, 
    { params } : { params: Promise<{ token: string }> }
) {
    const _params = await params;
    const token = _params.token;
    let connection = await pool.getConnection();
    if (!token) {
        return NextResponse.json({ error: "Token manquant" }, { status: 402 });
    }
    const decodedToken = verifyToken(token);
    const userId = decodedToken.id;
    try {
        // On charge les 20 twists les plus récents.
        const [rows, fields] = await connection.query(
         "SELECT p.id, p.user_id, p.content, p.like_count, p.created_at, u.email, "
          + userId + " = u.id as cannotFollow"
          + " from posts p, users u where p.user_id = " 
          + userId + " and p.user_id = u.id "
          + " order by p.id desc limit 20"
          /**"SELECT p.id, p.user_id, p.content, p.like_count, p.created_at, p.media_url, u.username " +
          "FROM posts p JOIN users u ON p.user_id = u.id " +
          "ORDER BY p.id DESC LIMIT 20" */
        );
        //console.log(rows);
        //connection.destroy();
        return NextResponse.json(
          { message: "Twists retrouvés avec succès",
            content: rows,
            userId: userId
           },          
          { status: 200 }
        );
      } catch (error) {
        console.error("Erreur dans le serveur : ", error); // Log l'erreur
        connection.destroy();
        return NextResponse.json({ error: "Erreur serveur" }, { status: 508 });
      }
}