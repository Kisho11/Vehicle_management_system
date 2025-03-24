import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import VehicleList from './pages/VehicleList';
import VehicleEdit from './pages/VehicleEdit';
import ImportData from './pages/ImportData';
import NotificationStack from './components/NotificationStack';
import websocketService from './services/websocketService';

function App() {
  // Connect to WebSocket when app loads
  useEffect(() => {
    websocketService.connect();
    
    // Clean up on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-100">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vehicles" element={<VehicleList />} />
            <Route path="/vehicles/add" element={<VehicleEdit />} />
            <Route path="/vehicles/edit/:id" element={<VehicleEdit />} />
            <Route path="/import" element={<ImportData />} />
          </Routes>
        </main>
        <Footer />
        <NotificationStack />
      </div>
    </Router>
  );
}

export default App;