import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function GET(req: Request, context: { params: { id: string } }) {
    try {
        const { id: userId } = await context.params;

        if (!userId) {
            return NextResponse.json({ error: "ID utilisateur manquant" }, { status: 400 });
        }

        const [rows]: any = await pool.query(
            "SELECT id, username, profilePic, bio FROM users WHERE id = ?",
            [userId]
        );
        
        if (rows.length === 0) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }
        
        const [followerIds]: any = await pool.query(
            "SELECT user1 AS id FROM follows WHERE user2 = ?",
            [userId]
        );
        const [followingIds]: any = await pool.query(
            "SELECT user2 AS id FROM follows WHERE user1 = ?",
            [userId]
        );
        
        const followerIdList = followerIds.map((f: any) => f.id);
        const followingIdList = followingIds.map((f: any) => f.id);
        
        const followersDetails = followerIdList.length
            ? await pool.query(
                `SELECT id, username, profilePic, bio FROM users WHERE id IN (${followerIdList.map(() => '?').join(',')})`,
                followerIdList
            )
            : [[]];
        
        const followingDetails = followingIdList.length
            ? await pool.query(
                `SELECT id, username, profilePic, bio FROM users WHERE id IN (${followingIdList.map(() => '?').join(',')})`,
                followingIdList
            )
            : [[]];
                
        const [userPosts]: any = await pool.query(
            `SELECT p.*, u.username, u.profilePic
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC`,
            [userId]
        );
        
        const [userLikes]: any = await pool.query(
            `SELECT p.*, u.username, u.profilePic
            FROM likes l
            JOIN posts p ON l.post_id = p.id
            JOIN users u ON p.user_id = u.id
            WHERE l.user_id = ?
            ORDER BY p.created_at DESC`,
            [userId]
        );
  
        return NextResponse.json({
            ...rows[0],
            followers: followersDetails[0],
            following: followingDetails[0],
            posts: userPosts,
            likes: userLikes,
        });
        

        } catch (error) {
        console.error("Erreur serveur :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
        }
        }
