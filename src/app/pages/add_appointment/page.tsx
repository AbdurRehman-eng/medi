'use client';
import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { supabase } from '@/app/supabase/supabaseclient';
import { useUserContext } from '@/app/context/UserContext';
import { useRouter } from 'next/navigation';

interface Doctor {
  id: number;
  name: string;
  clinic_location: string;
  contact: string;
  specialization: string;
  email: string;
}

interface FormData {
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  start_time: string;
  end_time: string;
}

export default function Appointment() {
  const router = useRouter()
  const { userId } = useUserContext(); // Access the user_id from the context
  const [formData, setFormData] = useState<FormData>({
    patient_id: '',
    patient_name: '',
    doctor_id: '',
    doctor_name: '',
    start_time: '',
    end_time: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [doctorData, setDoctorData] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(false);

  // Fetch patient name from the 'patient' table based on user id
  // Fetch patient name from the 'patient' table based on user_id
const fetchPatientName = async (userId: string) => {
  try {
    // Step 1: Fetch the user's ID from the 'users' table based on user_id
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id')
      .eq('user_id', userId)
      .single(); // Get single user
      console.log(userData?.id)
      if (userError || !userData) {
        throw new Error('Error fetching user data.');
      }

      const userIdFromDb = userData.id;
      // Step 2: Fetch the patient's name from the 'patient' table using the user's ID
      const { data: patientData, error: patientError } = await supabase
        .from('patient')
        .select('first_name, last_name')
        .eq('id', userIdFromDb)
        .single(); // Get single patient

      if (patientError || !patientData) {
        throw new Error('Error fetching patient name.');
      }

      // Set patient name in formData
      setFormData((prev) => ({
        ...prev,
        patient_id: userIdFromDb,
        patient_name: `${patientData.first_name} ${patientData.last_name}`,
      }));
    } catch (err) {
      setError('Error fetching patient name.');
    }
  };


  // Fetch doctor details
  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const { data, error } = await supabase.from('doctor').select('*');
      if (error) throw error;

      setDoctorData(data || []);
    } catch (err) {
      setError('Error fetching doctor details.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Handle form input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (
      !formData.patient_id ||
      !formData.patient_name ||
      !formData.doctor_id ||
      !formData.doctor_name ||
      !formData.start_time ||
      !formData.end_time
    ) {
      setError('Please fill in all fields');
      return;
    }

    const { data: newData, error } = await supabase
      .from('appointment')
      .insert([formData]);

    if (error) {
      setError(`Error: ${error.message}`);
      setSuccessMessage('');
    } else {
      setSuccessMessage('Appointment added successfully!');
      setError('');

      // Reset form fields
      setFormData({
        patient_id: '',
        patient_name: '',
        doctor_id: '',
        doctor_name: '',
        start_time: '',
        end_time: ''
      });
    }
    router.push("/pages/dashboard")
  };

  // Fetch patient name when user_id changes
  useEffect(() => {
    if (userId) {
      fetchPatientName(userId);
    }
  }, [userId]);

  // Fetch doctors when component mounts
  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#173b2b] to-[#2a5c46] p-8">
      <h1 className="text-3xl text-white font-bold mb-6">Add Appointment</h1>

      {/* Display error message */}
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {/* Display success message */}
      {successMessage && <div className="text-green-600 mb-4">{successMessage}</div>}

      {/* Appointment Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <div className="space-y-4">
          {/* Patient Details (Autofilled) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Patient Name:</label>
            <input
              type="text"
              name="patient_name"
              value={formData.patient_name}
              onChange={handleChange}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              disabled
            />
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Doctor:</label>
            <select
              name="doctor_id"
              value={formData.doctor_id}
              onChange={(e) => {
                const doctorId = e.target.value;
                const selectedDoctor = doctorData.find((doctor) => doctor.id.toString() === doctorId);
                if (selectedDoctor) {
                  setFormData((prev) => ({
                    ...prev,
                    doctor_id: doctorId,
                    doctor_name: selectedDoctor.name
                  }));
                }
              }}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              required
            >
              <option value="">Select a doctor</option>
              {doctorData.map((doctor) => (
                <option key={doctor.id} value={doctor.id.toString()}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </div>

          {/* Appointment Times */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Time:</label>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Time:</label>
            <input
              type="datetime-local"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>
        <button type="submit" className="mt-6 w-full px-4 py-2 bg-[#173b2b] text-white rounded-md hover:bg-[#133224] transform transition-all hover:scale-[1.02]">
          Add Appointment
        </button>
      </form>
    </div>
  );
}
