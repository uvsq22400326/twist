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
          "SELECT u.email " 
          + " from follows f, users u where f.user1 = " 
          + userId + " and u.id = f.user2 "
        );
        fields.forEach((field) => {
            console.log('field: ' + field.name);
        })
        //console.log(rows);
        return NextResponse.json(
          { message: "Abonnements retrouvés avec succès",
            content: rows
           },          
          { status: 200 }
        );
      } catch (error) {
        console.error("Erreur dans le serveur : ", error); // Log l'erreur
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
      }
}