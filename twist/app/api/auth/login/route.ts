import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password)
    return NextResponse.json(
      { error: "Tous les champs sont requis" },
      { status: 400 }
    );

  try {
    const [userResult] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    console.log("emal");
    if ((userResult as any[]).length === 0)
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );

    const user = (userResult as any[])[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("bcrypt");

    if (!isPasswordValid)
      return NextResponse.json(
        { error: "Mot de passe incorrect" },
        { status: 401 }
      );
    console.log("NextResponse");

    const token = jwt.sign(
      { id: user.id, email: user.email },
      "MySuperSecretKey123!",
      { expiresIn: "24h" }
    );

    console.log("jwt");

    return NextResponse.json(
      { message: "Connexion réussie", token },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
