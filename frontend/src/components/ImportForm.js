import React, { useState, useRef } from 'react';
import { importVehiclesFile } from '../services/vehicleService';

function ImportForm({ onImportSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const validateFile = (file) => {
    const allowedExtensions = ['csv', 'xlsx', 'xls'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      setError('Invalid file type. Please upload a CSV or Excel file.');
      return false;
    }
    
    // 10MB max file size
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    
    if (!validateFile(selectedFile)) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      const result = await importVehiclesFile(selectedFile);
      
      setSuccessMessage(result.message);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFile(null);
      
      // Notify parent component with job ID
      onImportSuccess(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import file. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">Import Vehicles Data</h2>
      
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
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
            Choose File (CSV or Excel)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="file"
            name="file"
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            The file should include the following columns: first_name, last_name, email, car_make, car_model, vin, manufactured_date
          </p>
          <p className="text-sm text-gray-600 mt-1">
            The age_of_vehicle will be calculated automatically based on the manufactured_date.
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={loading || !selectedFile}
          >
            {loading ? 'Importing...' : 'Import Data'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ImportForm;