"use server";

import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

export async function loginUser(email: string, password: string) {
  try {
    console.log("Tentative de connexion :", { email });

    const connection = await mysql.createConnection(dbConfig);
    const [users]: any = await connection.execute("SELECT * FROM users WHERE email = ?", [email]);
    await connection.end();

    if (users.length === 0) {
      return { message: "Utilisateur non trouvé" };
    }

    const user = users[0];

    console.log("Utilisateur trouvé :", user);

    // Vérification du mot de passe avec bcrypt
    //const isMatch = await bcrypt.compare(password, user.password);
    //console.log("Résultat bcrypt :", isMatch);
    console.log("password :"+password );
    console.log("user.password"+user.password);
    if (password!=user.password) {
      return { message: "Email ou mot de passe incorrect !" };
    }

    return { message: "Connexion réussie !" };
  } catch (error) {
    console.error("Erreur MySQL :", error);
    return { message: `Erreur lors de la connexion: ${error.message}` };
  }
}
