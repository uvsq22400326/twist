import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import bcrypt from "bcryptjs";
import { use } from "react";

export async function POST(req: Request) {
    try {
      console.log("Requête reçue pour l'inscription...");
      const { firstName, lastName, username, email, password, birthDate } = await req.json();
      console.log("Données reçues :", { firstName, lastName, email, birthDate });
  
      if (!firstName || !lastName || !username || !email || !password || !birthDate) {
        console.log("Erreur : Champs manquants !");
        return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
      }

      // Vérifie que le username est unique
      const [existingUsername] = await pool.query("SELECT id FROM users WHERE username = ?", [username]);
      if ((existingUsername as any[]).length > 0) {
        console.log("Erreur : Nom d'utilisateur déjà pris !");
        return NextResponse.json({ error: "Ce nom d'utilisateur est déjà pris" }, { status: 400 });
      }
  
      // verifie si l'utilisateur existe déjà
      const [existingUser] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
      if ((existingUser as any[]).length > 0) {
        console.log("Erreur : Email déjà utilisé !");
        return NextResponse.json({ error: "Email déjà utilisé" }, { status: 400 });
      }
  
      // Hachage du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        "INSERT INTO users (firstName, lastName, username, email, password, birthDate) VALUES (?, ?, ?, ?, ?, ?)",
        [firstName, lastName, username, email, hashedPassword, birthDate]
      );
  
      console.log("Utilisateur ajouté à la base !");
      return NextResponse.json({ message: "Compte créé avec succès !" }, { status: 201 });
    } catch (error) {
      console.error("Erreur serveur :", error);
      return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
