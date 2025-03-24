import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { deleteVehicle } from '../services/vehicleService';

function VehicleTable({ vehicles, onVehicleDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filteredVehicles, setFilteredVehicles] = useState(vehicles);
  const [filters, setFilters] = useState({
    id: '',
    owner: '',
    email: '',
    vehicle: '',
    vin: '',
    manufacturedDate: '',
    age: ''
  });
  
  // Pagination states
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Update filtered vehicles when vehicles prop or filters change
  useEffect(() => {
    let result = [...vehicles];
    
    // Apply filters for each column
    if (filters.id) {
      result = result.filter(v => v.id.toString().includes(filters.id));
    }
    
    if (filters.owner) {
      const ownerSearch = filters.owner.toLowerCase();
      result = result.filter(v => 
        `${v.first_name} ${v.last_name}`.toLowerCase().includes(ownerSearch)
      );
    }
    
    if (filters.email) {
      result = result.filter(v => 
        v.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }
    
    if (filters.vehicle) {
      const vehicleSearch = filters.vehicle.toLowerCase();
      result = result.filter(v => 
        `${v.car_make} ${v.car_model}`.toLowerCase().includes(vehicleSearch)
      );
    }
    
    if (filters.vin) {
      result = result.filter(v => 
        v.vin.toLowerCase().includes(filters.vin.toLowerCase())
      );
    }
    
    if (filters.manufacturedDate) {
      result = result.filter(v => 
        new Date(v.manufactured_date).toLocaleDateString().includes(filters.manufacturedDate)
      );
    }
    
    if (filters.age) {
      result = result.filter(v => 
        v.age_of_vehicle.toString().includes(filters.age)
      );
    }
    
    setFilteredVehicles(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [vehicles, filters]);

  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        setLoading(true);
        setError(null);
        await deleteVehicle(id);
        onVehicleDeleted();
      } catch (err) {
        setError('Failed to delete vehicle. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const clearAllFilters = () => {
    setFilters({
      id: '',
      owner: '',
      email: '',
      vehicle: '',
      vin: '',
      manufacturedDate: '',
      age: ''
    });
  };
  
  // Handle rows per page change
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredVehicles.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);
  
  // Handle page navigation
  const goToPage = (page) => {
    setCurrentPage(page);
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="overflow-x-auto">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <span className="mr-2">Show</span>
          <select 
            value={rowsPerPage} 
            onChange={handleRowsPerPageChange}
            className="border rounded p-1"
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
          </select>
          <span className="ml-2">rows per page</span>
          
          <div className="ml-4">
            <span>Showing {filteredVehicles.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredVehicles.length)} of {filteredVehicles.length} vehicles</span>
          </div>
        </div>
        
        <button 
          onClick={clearAllFilters}
          className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm"
        >
          Clear All Filters
        </button>
      </div>
      
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">
              <div className="flex flex-col">
                <span>ID</span>
                <input
                  type="text"
                  value={filters.id}
                  onChange={(e) => handleFilterChange('id', e.target.value)}
                  className="mt-1 p-1 border rounded text-sm"
                  placeholder="Search ID..."
                />
              </div>
            </th>
            <th className="py-2 px-4 border-b">
              <div className="flex flex-col">
                <span>Owner</span>
                <input
                  type="text"
                  value={filters.owner}
                  onChange={(e) => handleFilterChange('owner', e.target.value)}
                  className="mt-1 p-1 border rounded text-sm"
                  placeholder="Search owner..."
                />
              </div>
            </th>
            <th className="py-2 px-4 border-b">
              <div className="flex flex-col">
                <span>Email</span>
                <input
                  type="text"
                  value={filters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  className="mt-1 p-1 border rounded text-sm"
                  placeholder="Search email..."
                />
              </div>
            </th>
            <th className="py-2 px-4 border-b">
              <div className="flex flex-col">
                <span>Vehicle</span>
                <input
                  type="text"
                  value={filters.vehicle}
                  onChange={(e) => handleFilterChange('vehicle', e.target.value)}
                  className="mt-1 p-1 border rounded text-sm"
                  placeholder="Search vehicle..."
                />
              </div>
            </th>
            <th className="py-2 px-4 border-b">
              <div className="flex flex-col">
                <span>VIN</span>
                <input
                  type="text"
                  value={filters.vin}
                  onChange={(e) => handleFilterChange('vin', e.target.value)}
                  className="mt-1 p-1 border rounded text-sm"
                  placeholder="Search VIN..."
                />
              </div>
            </th>
            <th className="py-2 px-4 border-b">
              <div className="flex flex-col">
                <span>Manufactured Date</span>
                <input
                  type="text"
                  value={filters.manufacturedDate}
                  onChange={(e) => handleFilterChange('manufacturedDate', e.target.value)}
                  className="mt-1 p-1 border rounded text-sm"
                  placeholder="Search date..."
                />
              </div>
            </th>
            <th className="py-2 px-4 border-b">
              <div className="flex flex-col">
                <span>Vehicle Age</span>
                <input
                  type="text"
                  value={filters.age}
                  onChange={(e) => handleFilterChange('age', e.target.value)}
                  className="mt-1 p-1 border rounded text-sm"
                  placeholder="Search age..."
                />
              </div>
            </th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentVehicles.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-4 px-4 text-center">No vehicles found</td>
            </tr>
          ) : (
            currentVehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td className="py-2 px-4 border-b">{vehicle.id}</td>
                <td className="py-2 px-4 border-b">{`${vehicle.first_name} ${vehicle.last_name}`}</td>
                <td className="py-2 px-4 border-b">{vehicle.email}</td>
                <td className="py-2 px-4 border-b">{`${vehicle.car_make} ${vehicle.car_model}`}</td>
                <td className="py-2 px-4 border-b">{vehicle.vin}</td>
                <td className="py-2 px-4 border-b">{new Date(vehicle.manufactured_date).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">{vehicle.age_of_vehicle} years</td>
                <td className="py-2 px-4 border-b">
                  <div className="flex space-x-2">
                    <Link
                      to={`/vehicles/edit/${vehicle.id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      disabled={loading}
                      className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-sm"
                    >
                      {loading ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {/* Pagination controls */}
      {filteredVehicles.length > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <div>
            <span>Page {currentPage} of {totalPages}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border bg-gray-100 disabled:opacity-50"
            >
              First
            </button>
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border bg-gray-100 disabled:opacity-50"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VehicleTable;