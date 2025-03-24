import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchVehicleById, updateVehicle, createVehicle } from '../services/vehicleService';
import VehicleForm from '../components/VehicleForm';

function VehicleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      const loadVehicle = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await fetchVehicleById(parseInt(id));
          setVehicle(data);
        } catch (err) {
          setError('Failed to load vehicle data');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      loadVehicle();
    }
  }, [id, isEditing]);

  const handleSubmit = async (formData) => {
    try {
      if (isEditing && vehicle) {
        await updateVehicle(vehicle.id, formData);
        setToast({
          message: 'Vehicle updated successfully',
          type: 'success',
        });
      } else {
        await createVehicle(formData);
        setToast({
          message: 'Vehicle created successfully',
          type: 'success',
        });
      }
      navigate('/vehicles');
    } catch (err) {
      setError('Failed to save vehicle');
      console.error(err);
      throw err; // Re-throw to let the form component handle the error state
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2">Loading vehicle data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
      </h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <VehicleForm
        initialData={vehicle}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />

      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded shadow-lg 
                         ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} 
                         text-white`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default VehicleEdit;