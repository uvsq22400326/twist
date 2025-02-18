import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function GET(req:Request) {
    //const content = await req.json();
    try {    
        // On charge les 20 twists les plus récents.
        const [rows, fields] = await pool.query(
          "SELECT * from posts order by id desc limit 20"
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