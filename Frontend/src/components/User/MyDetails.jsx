import React from "react";

const MyDetails = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Details updated successfully!");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Personal Details
        </h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="First Name"
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            required
          />
          <input
            type="date"
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            required
          />
          <input
            type="tel"
            placeholder="Mobile Phone"
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            required
          />
          <input
            type="text"
            placeholder="Postal / Zip Code"
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="text"
            placeholder="City"
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="text"
            placeholder="Country"
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="text"
            placeholder="Address Line"
            className="md:col-span-2 border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyDetails;
