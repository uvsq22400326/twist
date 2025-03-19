"use client";

import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState("loading");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get the token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");
    setToken(urlToken);

    if (!urlToken) {
      setStatus("error");
      return;
    }

    // Verify the token
    async function verifyToken() {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: urlToken }),
        });

        if (res.ok) {
          setStatus("success");
          setTimeout(() => {
            window.location.href = "/login";
          }, 3000);
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        setStatus("error");
      }
    }

    verifyToken();
  }, []);

  return (
    <div
      style={{
        background: "#1e1e1e",
        padding: "40px",
        textAlign: "center",
        width: "350px",
        borderRadius: "12px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.5)",
      }}
    >
      <h1
        style={{
          fontSize: "26px",
          fontWeight: "bold",
          marginBottom: "20px",
          color: "#ffffff",
        }}
      >
        Email Verification
      </h1>

      {status === "loading" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              border: "4px solid rgba(255, 255, 255, 0.3)",
              borderTop: "4px solid #ffffff",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              animation: "spin 1s linear infinite",
              marginBottom: "20px",
            }}
            className="spinner"
          ></div>
          <p style={{ color: "white" }}>Verifying your email...</p>
        </div>
      )}

      {status === "success" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "50px",
              marginBottom: "20px",
              color: "#4caf50",
            }}
          >
            ✓
          </div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "10px",
              color: "#ffffff",
            }}
          >
            Email Verified Successfully!
          </h2>
          <p style={{ color: "white" }}>
            Your email has been verified. Redirecting to login page...
          </p>
        </div>
      )}

      {status === "error" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "50px",
              marginBottom: "20px",
              color: "#f44336",
            }}
          >
            ✗
          </div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "10px",
              color: "#ffffff",
            }}
          >
            Verification Failed
          </h2>
          <p style={{ color: "white" }}>
            The verification link is invalid or has expired.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            style={{
              backgroundColor: "#0790d5",
              color: "white",
              padding: "12px 24px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              marginTop: "15px",
            }}
          >
            Go to Login
          </button>
        </div>
      )}
      <style jsx global>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
