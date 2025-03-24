import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImportForm from '../components/ImportForm';
import JobStatus from '../components/JobStatus';

function ImportData() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [currentJobId, setCurrentJobId] = useState(null);

  const handleImportStart = (result) => {
    if (result.jobId) {
      setCurrentJobId(result.jobId);
      setToast({
        message: 'Import job started',
        type: 'info',
      });
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => {
        setToast(null);
      }, 3000);
    }
  };

  const handleImportComplete = () => {
    setToast({
      message: 'Data imported successfully',
      type: 'success',
    });
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Import Vehicle Data</h1>
      
      <div className="mb-8">
        <p className="text-gray-700">
          Upload Excel or CSV files containing vehicle data. The system will automatically 
          calculate the age_of_vehicle based on the manufactured_date during import.
        </p>
        <p className="text-gray-700 mt-2">
          Required columns: first_name, last_name, email, car_make, car_model, vin, manufactured_date
        </p>
      </div>
      
      {currentJobId ? (
        <JobStatus jobId={currentJobId} onComplete={handleImportComplete} />
      ) : (
        <ImportForm onImportSuccess={handleImportStart} />
      )}
      
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded shadow-lg 
                         ${toast.type === 'success' ? 'bg-green-500' : 
                           toast.type === 'info' ? 'bg-blue-500' : 'bg-red-500'} 
                         text-white`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default ImportData;