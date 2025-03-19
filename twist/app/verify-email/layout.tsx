"use client";

import React, { useEffect, useState } from "react";

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  // Only show content after mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return minimal content during SSR
  if (!mounted) {
    return <div style={{ display: "none" }}>Loading...</div>;
  }

  // Return content after mounted on client
  return (
    <div
      style={{
        backgroundColor: "#121212",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {children}
    </div>
  );
}
