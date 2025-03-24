import api from './api';

// Fetch all vehicles with pagination and optional search
export const fetchVehicles = async (page = 0, limit = 20, search = '') => {
  const params = { page, limit };
  if (search) {
    params.search = search;
  }
  
  const response = await api.get('/vehicles', { params });
  return response.data;
};

// Fetch a single vehicle by ID
export const fetchVehicleById = async (id) => {
  const response = await api.get(`/vehicles/${id}`);
  return response.data;
};

// Create a new vehicle
export const createVehicle = async (vehicleData) => {
  const response = await api.post('/vehicles', vehicleData);
  return response.data;
};

// Update an existing vehicle
export const updateVehicle = async (id, vehicleData) => {
  const response = await api.patch(`/vehicles/${id}`, vehicleData);
  return response.data;
};

// Delete a vehicle
export const deleteVehicle = async (id) => {
  await api.delete(`/vehicles/${id}`);
};

// Import vehicles from file
export const importVehiclesFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/import/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Get import job status
export const getImportJobStatus = async (jobId) => {
  const response = await api.get(`/import/job/${jobId}`);
  return response.data;
};

// Export vehicles by age
export const exportVehiclesByAge = async (minAge) => {
  const response = await api.post(`/export/age/${minAge}`);
  return response.data;
};

// Get export job status
export const getExportJobStatus = async (jobId) => {
  const response = await api.get(`/export/job/${jobId}`);
  return response.data;
};

// Download exported file
// export const getExportDownloadUrl = (fileName) => {
//   return `${api.defaults.baseURL}/export/download/${fileName}`;
// };

// export const getExportDownloadUrl = (fileName) => {
//   const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
//   return `${baseUrl}/export/download/${fileName}`;
// };

export const getExportDownloadUrl = (fileName) => {
  const baseUrl = 'http://localhost:3005/api';
  return `${baseUrl}/export/download/${fileName}`;
};