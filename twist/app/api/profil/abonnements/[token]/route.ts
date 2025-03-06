import { NextResponse } from "next/server";
import pool from "../../../../../lib/db";
import { verifyToken } from "../../../../../lib/auth";

export async function GET(request: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    let connection = await pool.getConnection();
    const _params = await params;
    const token = _params.token;
    if (!token) {
        return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }
    const decodedToken = verifyToken(token);
    const userId = decodedToken.id;
    try {
        const [rows, fields] = await connection.query(
          "SELECT u.email " 
          + " from follows f, users u where f.user1 = " 
          + userId + " and u.id = f.user2"
        );
        fields.forEach((field) => {
            console.log('field: ' + field.name);
        })
        //console.log(rows);
        connection.destroy();
        return NextResponse.json(
          { message: "Abonnements retrouvés avec succès",
            content: rows,
            userId: userId
           },          
          { status: 200 }
        );
      } catch (error) {
        console.error("Erreur dans le serveur : ", error); // Log l'erreur
        connection.destroy();
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
      }
}