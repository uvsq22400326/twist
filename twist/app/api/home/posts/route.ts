import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function GET(req:Request) {
    //const content = await req.json();
    try {    
        // On charge les 20 twists les plus récents.
        const [rows, fields] = await pool.query(
          "SELECT p.id, p.user_id, p.content, p.like_count, p.created_at, p.media_url, u.email " +
          "FROM posts p JOIN users u ON p.user_id = u.id " +
          "ORDER BY p.id DESC LIMIT 20"
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