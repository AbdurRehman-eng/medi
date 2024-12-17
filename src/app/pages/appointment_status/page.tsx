'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/supabase/supabaseclient';
import { useUserContext } from '@/app/context/UserContext';

// Define types for the appointment status
interface Appointment {
  doctor_name: string;
  confirm: boolean;
}

export default function AppointmentStatus() {
  const { userId } = useUserContext(); // Getting the userId from the context
  const [appointmentStatus, setAppointmentStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch patient appointments on component mount
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userId) {
        setError('User is not logged in.');
        return;
      }

      setLoading(true);
      setError(null);
      setAppointmentStatus('');

      try {
        // Fetch the patient's ID using the userId from the 'users' table
        const { data: userData, error: userError } = await supabase
          .from('user')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (userError || !userData) {
          setError('Error fetching user data.');
          return;
        }

        const patientId = userData.id;

        // Fetch appointments for the patient using the patientId
        const { data, error: appointmentsError } = await supabase
          .from<Appointment>('appointment') // Table name: 'appointment', Type: Appointment
          .select('doctor_name, confirm')
          .eq('patient_id', patientId);

        if (appointmentsError || !data || data.length === 0) {
          setError('No appointments found for the given patient.');
        } else {
          // Map through the appointments to set the statuses
          const statuses = data.map((appointment) => {
            const { doctor_name, confirm } = appointment;
            return confirm
              ? `Your appointment with Dr. ${doctor_name} is accepted.`
              : `Your appointment with Dr. ${doctor_name} is not yet accepted.`;
          });

          setAppointmentStatus(statuses.join('\n')); // Combine all statuses into a single string
        }
      } catch (err) {
        setError('An unexpected error occurred while checking the appointment status.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [userId]);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Check Appointment Status</h1>

      {/* Display error message */}
      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      {/* Display appointment status */}
      {appointmentStatus && (
        <div
          style={{
            whiteSpace: 'pre-wrap',
            color: 'green',
            padding: '10px',
            border: '1px solid green',
            borderRadius: '5px',
            marginBottom: '20px'
          }}
        >
          {appointmentStatus}
        </div>
      )}

      {/* Display loading message */}
      {loading && <div style={{ marginTop: '20px', textAlign: 'center' }}>Checking appointment status...</div>}
    </div>
  );
}
