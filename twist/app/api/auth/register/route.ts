import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "../../../../lib/emailVerification";
import { sendVerificationEmail } from "../../../../lib/emailService";

export async function POST(req: Request) {
  try {
    console.log("Requête reçue pour l'inscription...");
    const { firstName, lastName, username, email, password, birthDate } =
      await req.json();
    console.log("Données reçues :", {
      firstName,
      lastName,
      username,
      email,
      birthDate,
    });

    if (
      !firstName ||
      !username ||
      !lastName ||
      !email ||
      !password ||
      !birthDate
    ) {
      console.log("Erreur : Champs manquants !");
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // verifie si l'utilisateur existe déjà
    const [existingUser] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if ((existingUser as any[]).length > 0) {
      console.log("Erreur : Email déjà utilisé !");
      return NextResponse.json(
        { error: "Email déjà utilisé" },
        { status: 400 }
      );
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // MODIFICATION: Ajout du champ email_verified à 0
    const [result] = await pool.query(
      "INSERT INTO users (firstName, lastName, username, email, password, birthDate, email_verified) VALUES (?, ?, ?, ?, ?, ?, 0)",
      [firstName, lastName, username, email, hashedPassword, birthDate]
    );

    //  Récupération de l'ID utilisateur
    const userId = (result as any).insertId;

    //  Génération du token de vérification
    const token = await generateVerificationToken(userId);

    //  Envoi de l'email de vérification
    await sendVerificationEmail(email, token);

    console.log("Utilisateur ajouté à la base !");
    return NextResponse.json(
      {
        message:
          "Compte créé avec succès ! Veuillez vérifier votre email pour activer votre compte.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur serveur :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
