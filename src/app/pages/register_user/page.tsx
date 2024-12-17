"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { supabase } from "@/app/supabase/supabaseclient";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/firebase/firebase";  // Import Firebase auth configuration

function RegisterPatient() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    address: "",
    contact: "",
    email: "",
    password: "",
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

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    // Validate form data
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.address ||
      !formData.contact ||
      !formData.email ||
      !formData.password
    ) {
      setError("Please fill in all fields");
      return;
    }
  
    try {
      // Step 1: Get the highest user_id from the user table
      const { data: maxUserIdData, error: maxUserIdError } = await supabase
        .from("user")
        .select("user_id")
        .order("user_id", { ascending: false })
        .limit(1);
  
      if (maxUserIdError) {
        setError(`Error retrieving max user_id: ${maxUserIdError.message}`);
        return;
      }
  
      // Determine the new user_id (max(user_id) + 1)
      const highestUserId = maxUserIdData?.[0]?.user_id || 0; // If no rows exist, start with ID 1
      const newUserId = highestUserId + 1;
  
      // Step 2: Get the highest id from the patient table
      const { data: maxPatientIdData, error: maxPatientIdError } = await supabase
        .from("patient")
        .select("id")
        .order("id", { ascending: false })
        .limit(1);
  
      if (maxPatientIdError) {
        setError(`Error retrieving max patient_id: ${maxPatientIdError.message}`);
        return;
      }
  
      // Determine the new patient_id (max(patient_id) + 1)
      const highestPatientId = maxPatientIdData?.[0]?.id || 0; // If no rows exist, start with ID 1
      const newPatientId = highestPatientId + 1;
  
      // Step 3: Insert into the patient table with the new patient_id
      const { data: patientData, error: patientError } = await supabase
        .from("patient")
        .insert([
          {
            id: newPatientId, // Use the new patient_id
            first_name: formData.first_name,
            last_name: formData.last_name,
            address: formData.address,
            contact: formData.contact,
            email: formData.email,
            password: formData.password,
          },
        ]);
  
      if (patientError) {
        setError(`Error adding patient: ${patientError.message}`);
        return;
      }
  
      // Step 4: Insert into the user table with the new user_id and type "patient"
      const { error: userInsertError } = await supabase.from("user").insert([
        {
          user_id: newUserId, // Use the new user_id
          type: "patient", // Set type to "patient"
          email: formData.email, // Include email from the form
          id: newPatientId, // Store the new patient_id in the user table
        },
      ]);
  
      if (userInsertError) {
        setError(`Error adding user: ${userInsertError.message}`);
        return;
      }
  
      // Firebase Registration (Example)
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      if (userCredential.user) {
        // Handle successful user creation with Firebase
        console.log("Firebase User created:", userCredential.user);
      }
  
      // Success message
      setSuccessMessage("Patient registered successfully!");
      setError(null);
  
      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        address: "",
        contact: "",
        email: "",
        password: "",
      });
  
      // Redirect to login page
      router.push("/pages/login");
    } catch (err: any) {
      // Handle errors thrown during the process
      setError(`An error occurred: ${err.message}`);
    }
  };  
  
  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#4CAF50" }}>Register Patient</h1>

      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
      {successMessage && (
        <div style={{ color: "green", marginBottom: "10px" }}>{successMessage}</div>
      )}

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
          <label htmlFor="first_name" style={{ fontWeight: "bold" }}>
            First Name:
          </label>
          <input
            type="text"
            name="first_name"
            id="first_name"
            value={formData.first_name}
            onChange={handleChange}
            style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
            required
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label htmlFor="last_name" style={{ fontWeight: "bold" }}>
            Last Name:
          </label>
          <input
            type="text"
            name="last_name"
            id="last_name"
            value={formData.last_name}
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
          <label htmlFor="contact" style={{ fontWeight: "bold" }}>
            Contact:
          </label>
          <input
            type="text"
            name="contact"
            id="contact"
            value={formData.contact}
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
          Register Patient
        </button>
      </form>
    </div>
  );
}

export default RegisterPatient;
