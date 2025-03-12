import { NextResponse } from "next/server";
import pool from "../../../../../lib/db";

export async function GET(req: Request, 
    { params } : { params: Promise<{ postid: string }> })  {

    const _params = await params;
    const postId = _params.postid;

    const [rows, fields] = await pool.query(
        "SELECT c.id as commid, c.userid, c.content, u.username"
        + " FROM commentaire c, users u where u.id = c.userid AND c.post_id = " + postId
    );
    return NextResponse.json(
        { message: "Commentaires retrouvés avec succès",
            content: rows,
        },          
        { status: 200 }
    );
}