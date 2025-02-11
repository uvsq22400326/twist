"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = sessionStorage.getItem("user");

    if (user) {
      router.push("/home");
    } else {
      router.push("/login");
    }
  }, [router]);

  return null;


}

