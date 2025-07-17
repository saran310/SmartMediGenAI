"use client";
import React from "react";
import { useUser } from "@clerk/nextjs";

export default function Profile() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-start py-12 px-4 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#334155]">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-[#1e90ff] via-[#7f56d9] to-[#00e6e6] bg-clip-text text-transparent">
          Profile
        </h1>

        <div className="flex flex-col items-center">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-blue-200 dark:border-blue-800 shadow-md mb-4">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src="/logo.png"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="text-xl font-bold text-blue-700 dark:text-blue-200">
            {user?.fullName ? user.fullName : "No name"}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {user?.primaryEmailAddress?.emailAddress ?? "No email"}
          </div>
        </div>
      </div>
    </div>
  );
}
