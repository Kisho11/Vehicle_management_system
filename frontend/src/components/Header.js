import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vehicle Management System</h1>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link to="/" className="hover:underline">Dashboard</Link>
            </li>
            <li>
              <Link to="/vehicles" className="hover:underline">Vehicle List</Link>
            </li>
            <li>
              <Link to="/import" className="hover:underline">Import Data</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;