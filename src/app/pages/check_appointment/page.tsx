'use client';
import { useState, ChangeEvent, MouseEvent } from 'react';
import { supabase } from '@/app/supabase/supabaseclient';

interface Appointment {
  id: number;
  patient_name: string;
  start_time: string;
  end_time: string;
  confirm: boolean;
}

export default function CheckAppointment() {
  const [doctorId, setDoctorId] = useState<string>('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Handle input changes for Doctor ID
  const handleDoctorIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDoctorId(e.target.value);
  };

  // Fetch appointments for a specific doctor
  const handleFetchAppointments = async () => {
    if (!doctorId) {
      setError('Please enter a Doctor ID');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('appointment')
        .select('*')
        .eq('doctor_id', doctorId); // Fetch appointments for the given doctor_id

      if (error) {
        setError(`Error fetching appointments: ${error.message}`);
      } else {
        setAppointments(data || []);
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching appointments.');
    } finally {
      setLoading(false);
    }
  };

  // Handle changes in the appointment data (e.g., confirmation checkbox)
  const handleAppointmentChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value, type, checked } = e.target;
    const updatedAppointments = [...appointments];
    updatedAppointments[index] = {
      ...updatedAppointments[index],
      [name]: type === 'checkbox' ? checked : value
    };
    setAppointments(updatedAppointments);
  };

  // Commit changes to the database
  const handleCommitChanges = async () => {
    setLoading(true);
    setError(null);
    try {
      const updates = appointments.map((appointment) => ({
        id: appointment.id,
        confirm: appointment.confirm
      }));

      // Update each appointment in the database
      const { error } = await supabase
        .from('appointment')
        .upsert(updates, { onConflict: 'id' }); // Upsert to update existing records or insert new ones

      if (error) {
        setError(`Error committing changes: ${error.message}`);
      } else {
        setSuccessMessage('Changes committed successfully!');
      }
    } catch (err) {
      setError('An unexpected error occurred while committing changes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#173b2b] to-[#2a5c46] p-8">
      <h1 className="text-3xl text-white font-bold mb-6">Check and Update Appointments</h1>

      {/* Display error message */}
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {/* Display success message */}
      {successMessage && <div className="text-green-600 mb-4">{successMessage}</div>}

      {/* Input for Doctor ID */}
      <div className="mb-6">
        <label className="block text-white font-medium">Doctor ID:</label>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={doctorId}
            onChange={handleDoctorIdChange}
            placeholder="Enter Doctor ID"
            className="p-2 rounded-md border border-gray-300"
          />
          <button
            onClick={handleFetchAppointments}
            className="px-4 py-2 bg-[#173b2b] text-white rounded-md hover:bg-[#133224] transform transition-all hover:scale-105"
          >
            Fetch Appointments
          </button>
        </div>
      </div>

      {/* Display appointments table */}
      {loading && <div className="text-white">Loading appointments...</div>}

      {!loading && appointments.length > 0 && (
        <div className="w-full max-w-3xl overflow-x-auto">
          <table className="min-w-full bg-white text-sm shadow-lg rounded-lg border-separate space-y-6 table-auto">
            <thead className="bg-[#173b2b] text-white">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Patient Name</th>
                <th className="p-3 text-left">Start Time</th>
                <th className="p-3 text-left">End Time</th>
                <th className="p-3 text-left">Confirm</th>
              </tr>
            </thead>
            <tbody className="bg-gray-100">
              {appointments.map((appointment, index) => (
                <tr key={appointment.id} className="hover:bg-gray-200">
                  <td className="p-3">{appointment.id}</td>
                  <td className="p-3">{appointment.patient_name}</td>
                  <td className="p-3">{appointment.start_time}</td>
                  <td className="p-3">{appointment.end_time}</td>
                  <td className="p-3">
                    <input
                      type="checkbox"
                      name="confirm"
                      checked={appointment.confirm}
                      onChange={(e) => handleAppointmentChange(e, index)}
                      className="h-5 w-5"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Commit Changes Button */}
          <div className="mt-6">
            <button
              onClick={handleCommitChanges}
              className="px-6 py-3 bg-[#173b2b] text-white rounded-md hover:bg-[#133224] transform transition-all hover:scale-105"
            >
              Commit Changes
            </button>
          </div>
        </div>
      )}

      {!loading && appointments.length === 0 && <div className="text-white mt-4">No appointments found for this doctor.</div>}
    </div>
  );
}