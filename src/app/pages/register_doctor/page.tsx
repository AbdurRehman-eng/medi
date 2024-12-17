'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { supabase } from '@/app/supabase/supabaseclient';
import { useRouter } from 'next/navigation';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/app/firebase/firebase'; // Import your Firebase app configuration

interface DoctorData {
  name: string;
  clinic_location: string;
  contact: string;
  specialization: string;
  email: string;
  password: string;
}

export default function RegisterDoctor() {
  const [formData, setFormData] = useState<DoctorData>({
    name: '',
    clinic_location: '',
    contact: '',
    specialization: '',
    email: '',
    password: '',
  });
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

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

    // Ensure all fields are filled
    if (!formData.name || !formData.clinic_location || !formData.contact || !formData.specialization || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      // Register the user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Step 1: Fetch the maximum `id` from the doctor table
      const { data: doctorMaxData, error: doctorMaxError } = await supabase
        .from('doctor')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

      if (doctorMaxError) throw new Error(doctorMaxError.message);

      let newDoctorId = 1; // Default to 1 if no doctor exists
      if (doctorMaxData && doctorMaxData.length > 0) {
        newDoctorId = doctorMaxData[0].id + 1; // Increment the max id
      }

      // Step 2: Fetch the maximum `user_id` from the user table
      const { data: userMaxData, error: userMaxError } = await supabase
        .from('user')
        .select('user_id')
        .order('user_id', { ascending: false })
        .limit(1);

      if (userMaxError) throw new Error(userMaxError.message);

      let newUserId = 1; // Default to 1 if no user exists
      if (userMaxData && userMaxData.length > 0) {
        newUserId = userMaxData[0].user_id + 1; // Increment the max user_id
      }

      // Step 3: Insert the doctor into the doctor table with the calculated ID
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctor')
        .insert([
          {
            id: newDoctorId, // Use the calculated doctor ID
            name: formData.name,
            clinic_location: formData.clinic_location,
            contact: formData.contact,
            specialization: formData.specialization,
            email: formData.email,
            password: formData.password, // Store the password
          },
        ])
        .select('*')
        .single();

      if (doctorError) throw new Error(doctorError.message);

      // Step 4: Insert the user into the user table with the calculated user_id
      const { error: userInsertError } = await supabase
        .from('user')
        .insert([
          {
            user_id: newUserId, // Use the calculated user ID
            id: newDoctorId, // Associate this user with the doctor ID
            type: 'doctor',
            email: formData.email,
          },
        ]);

      if (userInsertError) throw new Error(userInsertError.message);

      // Step 5: Set success message and reset form
      setSuccessMessage('Doctor registered successfully!');
      setError('');

      // Reset form
      setFormData({
        name: '',
        clinic_location: '',
        contact: '',
        specialization: '',
        email: '',
        password: '',
      });

      router.push('/pages/login');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setSuccessMessage('');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Register Doctor</h1>

      {/* Display error message */}
      {error && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}

      {/* Display success message */}
      {successMessage && <div style={{ color: 'green', marginBottom: '10px', textAlign: 'center' }}>{successMessage}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Form Fields */}
        {['name', 'clinic_location', 'contact', 'specialization', 'email', 'password'].map((field) => (
          <div style={{ display: 'flex', flexDirection: 'column' }} key={field}>
            <label htmlFor={field} style={{ marginBottom: '5px', fontWeight: 'bold' }}>
              {field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}:
            </label>
            <input
              type={field === 'email' ? 'email' : field === 'password' ? 'password' : 'text'}
              name={field}
              id={field}
              value={formData[field as keyof DoctorData]}
              onChange={handleChange}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              required
            />
          </div>
        ))}

        <button
          type="submit"
          style={{
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.3s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
        >
          Register Doctor
        </button>
      </form>
    </div>
  );
}
