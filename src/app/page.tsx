'use client'
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in"); // Redirect to sign-in page
    }
  }, [isSignedIn, router]);

  if (!isSignedIn) {
    return <p>Redirecting to login...</p>;
  }

  
}
