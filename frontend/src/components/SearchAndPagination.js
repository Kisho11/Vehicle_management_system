import React, { useState } from 'react';

function SearchAndPagination({ onSearch, page, totalPages, onPageChange }) {
  const [searchText, setSearchText] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchText);
  };

  const handlePrevPage = () => {
    if (page > 0) {
      onPageChange(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      onPageChange(page + 1);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
      <form onSubmit={handleSearchSubmit} className="w-full md:w-auto">
        <div className="flex">
          {/* <input
            type="text"
            className="shadow appearance-none border rounded-l w-full md:w-64 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Search by model (e.g. 'M*')"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
          >
            Search
          </button> */}
        </div>
      </form>

      <div className="flex items-center space-x-2">
        <span className="text-gray-600">
          Page {page + 1} of {Math.max(1, totalPages)}
        </span>
        <button
          onClick={handlePrevPage}
          disabled={page === 0}
          className={`py-2 px-3 rounded ${
            page === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 text-white'
          }`}
        >
          Previous
        </button>
        <button
          onClick={handleNextPage}
          disabled={page >= totalPages - 1}
          className={`py-2 px-3 rounded ${
            page >= totalPages - 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 text-white'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default SearchAndPagination;