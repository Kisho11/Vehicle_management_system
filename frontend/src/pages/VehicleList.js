import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchVehicles } from '../services/vehicleService';
import VehicleTable from '../components/VehicleTable';
import SearchAndPagination from '../components/SearchAndPagination';
import ExportForm from '../components/ExportForm';
import NotificationStack from '../components/NotificationStack';

function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(0);
  const [limit] = useState(100);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const loadVehicles = async (currentPage = page, searchQuery = search) => {
    try {
      setLoading(true);
      const result = await fetchVehicles(currentPage, limit, searchQuery);
      setVehicles(result.data);
      setTotal(result.total);
      setTotalPages(Math.ceil(result.total / limit));
      setError(null);
    } catch (err) {
      setError('Failed to load vehicles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, [page]);

  const handleSearch = (query) => {
    setSearch(query);
    setPage(0); // Reset to first page
    loadVehicles(0, query);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleVehicleDeleted = () => {
    loadVehicles();
    setToast({
      message: 'Vehicle deleted successfully',
      type: 'success',
    });
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleExportStart = (result) => {
    setToast({
      message: `Export job started (ID: ${result.jobId})`,
      type: 'info',
    });
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vehicle List</h1>
        <Link
          to="/vehicles/add"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Add New Vehicle
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-3">
          <SearchAndPagination 
            onSearch={handleSearch}
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2">Loading vehicles...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="bg-white shadow-md rounded p-4 mb-4">
                <p className="text-gray-700">
                  Showing {vehicles.length} of {total} vehicles, sorted by manufactured date (ascending)
                </p>
              </div>
              <VehicleTable vehicles={vehicles} onVehicleDeleted={handleVehicleDeleted} />
            </>
          )}
        </div>
        
        <div className="lg:col-span-1">
          <ExportForm onExportStart={handleExportStart} />
        </div>
      </div>

      {/* Notification Stack will show WebSocket notifications */}
      <NotificationStack />

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

export default VehicleList;