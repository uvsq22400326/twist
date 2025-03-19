import { NextResponse } from "next/server";
import { verifyEmailToken } from "../../../../lib/emailVerification";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    console.log("Received token:", token);

    if (!token) {
      console.log("Token required");
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const userId = await verifyEmailToken(token);

    console.log("Verification result for token:", token, "is userId:", userId);

    if (!userId) {
      console.log("Invalid or expired token");
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    console.log(`Email verified successfully for user ${userId}`);
    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification failed:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
