import React, { useState, useRef } from 'react';
import { exportVehiclesByAge } from '../services/vehicleService';

function ExportForm({ onExportStart }) {
  const [minAge, setMinAge] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [exportResult, setExportResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      setExportResult(null);
      
      const result = await exportVehiclesByAge(minAge);
      setExportResult(result);
      
      setSuccessMessage(`Started export job for vehicles with age >= ${minAge}. Job ID: ${result.jobId}`);
      
      // Notify parent component
      if (onExportStart) {
        onExportStart(result);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start export job. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">Export Vehicles by Age</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
          <p>{successMessage}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="minAge">
            Minimum Vehicle Age (years)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="minAge"
            name="minAge"
            type="number"
            min="0"
            max="100"
            value={minAge}
            onChange={(e) => setMinAge(parseInt(e.target.value))}
            required
          />
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Export all vehicles that are {minAge} years or older to a CSV file.
          </p>
          <p className="text-sm text-gray-600 mt-1">
            You will receive a notification when the export is complete.
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Starting Export...' : 'Export Data'}
          </button>
        </div>
      </form>

      {/* Check for pending export job */}
      {exportResult && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="font-medium">Export job progress</p>
          <p className="text-sm text-gray-600">Job ID: {exportResult.jobId}</p>
          <p className="text-sm text-gray-600 mt-2">
            A notification will appear when your export is ready for download.
          </p>
        </div>
      )}
    </div>
  );
}

export default ExportForm;