import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchVehicles } from '../services/vehicleService';

function Dashboard() {
  const [vehiclesData, setVehiclesData] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const data = await fetchVehicles(0, 100); // Get first page with 100 records
        setVehiclesData(data);
      } catch (err) {
        setError('Failed to load vehicles data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

  const calculateStats = () => {
    const vehicles = vehiclesData.data || [];
    
    if (vehicles.length === 0) {
      return {
        totalVehicles: 0,
        averageAge: 0,
        oldestVehicle: null,
        newestVehicle: null,
      };
    }

    const totalVehicles = vehicles.length;
    const totalAge = vehicles.reduce((sum, vehicle) => sum + vehicle.age_of_vehicle, 0);
    const averageAge = totalAge / totalVehicles;
    
    const oldestVehicle = [...vehicles].sort((a, b) => b.age_of_vehicle - a.age_of_vehicle)[0];
    const newestVehicle = [...vehicles].sort((a, b) => a.age_of_vehicle - b.age_of_vehicle)[0];

    return {
      totalVehicles: vehiclesData.total || totalVehicles, // Use total from API if available
      averageAge,
      oldestVehicle,
      newestVehicle,
    };
  };

  const stats = calculateStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2">Loading dashboard data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Total Vehicles</h2>
              <p className="text-3xl font-bold text-blue-600">{stats.totalVehicles}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Average Vehicle Age</h2>
              <p className="text-3xl font-bold text-green-600">
                {stats.averageAge.toFixed(1)} years
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Oldest Vehicle</h2>
              {stats.oldestVehicle && (
                <div>
                  <p className="text-lg font-medium">
                    {stats.oldestVehicle.car_make} {stats.oldestVehicle.car_model}
                  </p>
                  <p className="text-gray-600">
                    {stats.oldestVehicle.age_of_vehicle} years old
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Newest Vehicle</h2>
              {stats.newestVehicle && (
                <div>
                  <p className="text-lg font-medium">
                    {stats.newestVehicle.car_make} {stats.newestVehicle.car_model}
                  </p>
                  <p className="text-gray-600">
                    {stats.newestVehicle.age_of_vehicle} years old
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Recent Vehicles</h2>
                  <Link
                    to="/vehicles"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View All
                  </Link>
                </div>

                {vehiclesData.data.length === 0 ? (
                  <p className="text-gray-500">No vehicles found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 text-left">Owner</th>
                          <th className="py-2 text-left">Vehicle</th>
                          <th className="py-2 text-left">Age</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehiclesData.data.slice(0, 5).map((vehicle) => (
                          <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                            <td className="py-2">{`${vehicle.first_name} ${vehicle.last_name}`}</td>
                            <td className="py-2">{`${vehicle.car_make} ${vehicle.car_model}`}</td>
                            <td className="py-2">{`${vehicle.age_of_vehicle} years`}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="md:w-1/3">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link
                    to="/vehicles/add"
                    className="block bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-center"
                  >
                    Add New Vehicle
                  </Link>
                  <Link
                    to="/import"
                    className="block bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-center"
                  >
                    Import Vehicle Data
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;