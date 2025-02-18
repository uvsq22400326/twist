import jwt, { JwtPayload } from "jsonwebtoken";

// Définir un type personnalisé pour le payload
interface CustomJwtPayload extends JwtPayload {
  id: string;
}

export function verifyToken(token: string): CustomJwtPayload {
  try {
    const decoded = jwt.verify(
      token,
      "MySuperSecretKey123!"
    ) as CustomJwtPayload;
    return decoded;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
}
