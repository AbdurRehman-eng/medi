"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { supabase } from "@/app/supabase/supabaseclient";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import FontAwesome icons

function RegisterPatient() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    address: "",
    contact: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      const { data: maxIdData, error: maxIdError } = await supabase
        .from("patient")
        .select("id")
        .order("id", { ascending: false })
        .limit(1);

      if (maxIdError) {
        setError(`Error retrieving ID: ${maxIdError.message}`);
        return;
      }

      const highestId = maxIdData?.[0]?.id || 0;
      const newId = highestId + 1;

      const { data: patientData, error: patientError } = await supabase
        .from("patient")
        .insert([
          {
            id: newId,
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

      const { error: userInsertError } = await supabase.from("user").insert([
        {
          id: newId,
          type: "patient",
        },
      ]);

      if (userInsertError) {
        setError(`Error adding user: ${userInsertError.message}`);
        return;
      }

      setSuccessMessage("Patient registered successfully!");
      setError(null);

      setFormData({
        first_name: "",
        last_name: "",
        address: "",
        contact: "",
        email: "",
        password: "",
      });

      router.push("/pages/dashboard");
    } catch (err) {
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: "linear-gradient(to right, #001f3d, #00457c)",
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg transform transition-all duration-300 hover:scale-[1.02]">
        <h2 className="text-3xl font-extrabold text-[#001f3d] text-center mb-6">
          Register Patient
        </h2>

        {error && (
          <div className="text-red-600 text-center mb-4 bg-red-100 p-2 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="text-green-600 text-center mb-4 bg-green-100 p-2 rounded">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="first_name"
                className="block text-lg font-medium text-[#003366]"
              >
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="e.g., Abdullah"
                className="w-full px-4 py-3 rounded-lg border-2 border-[#001f3d] focus:outline-none focus:ring-2 focus:ring-[#00457c] transition-all duration-300"
              />
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="block text-lg font-medium text-[#003366]"
              >
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="e.g., Ijaz"
                className="w-full px-4 py-3 rounded-lg border-2 border-[#001f3d] focus:outline-none focus:ring-2 focus:ring-[#00457c] transition-all duration-300"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-lg font-medium text-[#003366]"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g., 123 Main Street"
              className="w-full px-4 py-3 rounded-lg border-2 border-[#001f3d] focus:outline-none focus:ring-2 focus:ring-[#00457c] transition-all duration-300"
            />
          </div>

          <div>
            <label
              htmlFor="contact"
              className="block text-lg font-medium text-[#003366]"
            >
              Contact
            </label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="e.g., +923456789012"
              className="w-full px-4 py-3 rounded-lg border-2 border-[#001f3d] focus:outline-none focus:ring-2 focus:ring-[#00457c] transition-all duration-300"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-lg font-medium text-[#003366]"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., abc@example.com"
              className="w-full px-4 py-3 rounded-lg border-2 border-[#001f3d] focus:outline-none focus:ring-2 focus:ring-[#00457c] transition-all duration-300"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-lg font-medium text-[#003366]"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter a secure password"
                className="w-full px-4 py-3 rounded-lg border-2 border-[#001f3d] focus:outline-none focus:ring-2 focus:ring-[#00457c] transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-[#00457c] hover:text-[#001f3d]"
              >
                {showPassword ? <FaEye size={20} />:  <FaEyeSlash size={20} /> }
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#001f3d] text-white py-3 rounded-lg font-semibold hover:bg-[#003366] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#001f3d] transform transition-all duration-300 hover:scale-[1.02]"
          >
            Register Patient
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPatient;
