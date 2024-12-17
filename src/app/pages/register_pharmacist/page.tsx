"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { supabase } from "@/app/supabase/supabaseclient";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/firebase/firebase";

function RegisterPharmacist() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    password: "",
    pharmacy_name: "",  // New field added for pharmacy name
  });
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Handle form input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { name, address, email, phone, password, pharmacy_name } = formData;

    if (!name || !address || !email || !phone || !password || !pharmacy_name) {
      setError("Please fill in all fields");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      // Register email and password with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Step 1: Get the highest ID from the pharmacist table
      const { data: maxIdData, error: maxIdError } = await supabase
        .from("pharmacist")
        .select("id")
        .order("id", { ascending: false })
        .limit(1);

      if (maxIdError) {
        setError(`Error retrieving ID: ${maxIdError.message}`);
        return;
      }

      // Determine the new ID
      const highestId = maxIdData?.[0]?.id || 0; // If no rows exist, start with ID 1
      const newId = highestId + 1;

      //---------------------------------------------------------------
      const { data: maxUserIdData, error: maxUserIdError } = await supabase
        .from("user")
        .select("user_id")
        .order("user_id", { ascending: false })
        .limit(1);

      if (maxUserIdError) {
        setError(`Error retrieving ID: ${maxUserIdError.message}`);
        return;
      }

      // Determine the new ID
      const highestUserId = maxUserIdData?.[0]?.user_id || 0; // If no rows exist, start with ID 1
      const newUserId = highestUserId + 1;

      // Step 2: Insert into the pharmacist table with the manually assigned ID
      const { data: pharmacistData, error: pharmacistError } = await supabase
        .from("pharmacist")
        .insert([{
          id: newId, // Assign the new ID manually
          name,
          address,
          email,
          phone,
          password,
          pharmacy_name,  // Add the pharmacy name here
        }]);

      if (pharmacistError) {
        setError(`Error adding pharmacist: ${pharmacistError.message}`);
        return;
      }

      // Step 3: Insert into the user table with type "pharmacist"
      const { error: userInsertError } = await supabase.from("user").insert([{
        user_id: newUserId,
        id: newId, // Use the same manually assigned ID
        type: "pharmacist",
        email: formData.email,
      }]);

      if (userInsertError) {
        setError(`Error adding user: ${userInsertError.message}`);
        return;
      }

      setSuccessMessage("Pharmacist registered successfully!");
      setError(null);

      // Reset form
      setFormData({
        name: "",
        address: "",
        email: "",
        phone: "",
        password: "",
        pharmacy_name: "",  // Reset the new field as well
      });
      router.push("/pages/login");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#4CAF50" }}>Register Pharmacist</h1>

      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
      {successMessage && <div style={{ color: "green", marginBottom: "10px" }}>{successMessage}</div>}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          padding: "20px",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label htmlFor="name" style={{ fontWeight: "bold" }}>
            Name:
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
            required
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label htmlFor="address" style={{ fontWeight: "bold" }}>
            Address:
          </label>
          <input
            type="text"
            name="address"
            id="address"
            value={formData.address}
            onChange={handleChange}
            style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
            required
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label htmlFor="email" style={{ fontWeight: "bold" }}>
            Email:
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
            required
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label htmlFor="phone" style={{ fontWeight: "bold" }}>
            Phone:
          </label>
          <input
            type="text"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
            required
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label htmlFor="password" style={{ fontWeight: "bold" }}>
            Password:
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
            required
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label htmlFor="pharmacy_name" style={{ fontWeight: "bold" }}>
            Pharmacy Name:
          </label>
          <input
            type="text"
            name="pharmacy_name"
            id="pharmacy_name"
            value={formData.pharmacy_name}
            onChange={handleChange}
            style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "10px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Register Pharmacist
        </button>
      </form>
    </div>
  );
}

export default RegisterPharmacist;
