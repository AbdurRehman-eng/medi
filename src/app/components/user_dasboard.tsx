"use client";

import { useEffect, useState } from "react";
import { signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase/firebase";

function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if a user is currently signed in
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser); // Set the current user
    } else {
      router.push("login"); // Redirect to login if no user is signed in
    }
    setLoading(false);
  }, [auth, router]);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        router.push("/pages/login"); // Redirect to login on sign out
      })
      .catch((error) => {
        console.error("Sign-out error:", error);
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-2xl max-w-lg w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Welcome to the Dashboard
        </h1>
        {user && (
          <p className="text-center text-lg text-gray-600 mb-8">
            Signed in as: <span className="font-semibold">{user.email}</span>
          </p>
        )}

        <div className="space-y-4">
          <button
            onClick={() => router.push("/pages/profile")}
            className="w-full px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Go to Profile
          </button>
          {/* Replaced "Check Appointments" with "Add Appointment" */}
          <button
            onClick={() => router.push("/pages/add_appointment")}
            className="w-full px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition"
          >
            Add Appointment
          </button>
          <button
            onClick={() => router.push("/pages/appointment_status")}
            className="w-full px-6 py-3 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-purple-700 transition"
          >
            Appointment Status
          </button>
          <button
            onClick={() => router.push("/pages/search")}
            className="w-full px-6 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            Go to Search
          </button>
          <button
            onClick={handleSignOut}
            className="w-full px-6 py-3 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
