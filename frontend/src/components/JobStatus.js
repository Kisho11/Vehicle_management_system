import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImportJobStatus } from '../services/vehicleService';

function JobStatus({ jobId, onComplete }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const jobStatus = await getImportJobStatus(jobId);
        setStatus(jobStatus);
        
        // If job is completed or failed, stop polling
        if (['completed', 'failed'].includes(jobStatus.state)) {
          if (jobStatus.state === 'completed' && onComplete) {
            onComplete();
          }
          setLoading(false);
          return;
        }
        
        // Continue polling if job is still in progress
        setTimeout(checkStatus, 2000);
      } catch (err) {
        setError('Failed to fetch job status');
        console.error(err);
        setLoading(false);
      }
    };
    
    checkStatus();
  }, [jobId, onComplete]);
  
  const getStatusColor = () => {
    if (!status) return 'bg-gray-200';
    
    switch (status.state) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'active':
        return 'bg-blue-500';
      case 'waiting':
      case 'delayed':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-200';
    }
  };
  
  const getStatusText = () => {
    if (!status) return 'Loading...';
    
    switch (status.state) {
      case 'completed':
        return status.result?.message || 'Import completed successfully';
      case 'failed':
        return `Import failed: ${status.failedReason || 'Unknown error'}`;
      case 'active':
        return `Processing...${status.progress ? ` (${Math.round(status.progress)}%)` : ''}`;
      case 'waiting':
        return 'Waiting in queue...';
      case 'delayed':
        return 'Delayed, will retry soon...';
      default:
        return `Status: ${status.state}`;
    }
  };
  
  const handleViewVehicles = () => {
    navigate('/vehicles');
  };
  
  return (
    <div className="bg-white shadow-md rounded px-6 py-4 mb-4">
      <h2 className="text-lg font-semibold mb-3">Import Job Status</h2>
      
      {error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Job ID: {jobId}</p>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-gray-600">
                    Status
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-gray-600">
                    {status?.state || 'Unknown'}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div
                  style={{ width: `${status?.progress || 0}%` }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getStatusColor()}`}
                ></div>
              </div>
            </div>
            <p className="mt-2">{getStatusText()}</p>
          </div>
          
          {status?.state === 'completed' && (
            <button
              onClick={handleViewVehicles}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              View Imported Vehicles
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default JobStatus;