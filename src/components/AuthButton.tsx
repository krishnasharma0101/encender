"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-gray-700">Signed in as {session.user?.email}</span>
        <button
          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </div>
    );
  }
  return (
    <button
      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      onClick={() => signIn('google')}
    >
      Sign in with Google
    </button>
  );
} 