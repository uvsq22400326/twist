import { randomBytes } from "crypto";
import pool from "./db";
import { RowDataPacket } from "mysql2";

/**
 * Generate a verification token for a user and store it in the database
 */
export async function generateVerificationToken(
  userId: number
): Promise<string> {
  try {
    // Generate random token
    const token = randomBytes(32).toString("hex");

    // Token expires in 1 hour
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Store token in database
    await pool.query(
      "INSERT INTO verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [userId, token, expiresAt]
    );

    console.log(`Generated token for user ${userId}: ${token}`);

    return token;
  } catch (error) {
    console.error(`Error generating token for user ${userId}:`, error);
    throw error;
  }
}

interface VerificationRow extends RowDataPacket {
  user_id: number;
}

export async function verifyEmailToken(token: string): Promise<number | null> {
  try {
    // Check if token exists and is valid
    const [rows] = await pool.query<VerificationRow[]>(
      "SELECT user_id FROM verification_tokens WHERE token = ? AND expires_at > NOW()",
      [token]
    );

    if (rows.length === 0) {
      console.log(`Token verification failed: ${token}`);
      return null;
    }

    const userId = rows[0].user_id;

    // Mark user as verified
    await pool.query("UPDATE users SET email_verified = 1 WHERE id = ?", [
      userId,
    ]);

    // Delete the used token
    await pool.query("DELETE FROM verification_tokens WHERE token = ?", [
      token,
    ]);

    console.log(`Token verified for user ${userId}: ${token}`);

    return userId;
  } catch (error) {
    console.error(`Error verifying token ${token}:`, error);
    throw error;
  }
}
