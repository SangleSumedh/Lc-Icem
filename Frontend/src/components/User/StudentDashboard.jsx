import React from "react";

const StudentDashboard = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Your verification status is in progress
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          If you need to update your information, you will be able to request
          a change after current verification is completed.
        </p>

        {/* Simple Step Indicator */}
        <div className="flex items-center justify-between">
          <div className="w-1/4 h-2 bg-blue-500 rounded-full"></div>
          <div className="w-1/4 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-1/4 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-1/4 h-2 bg-gray-300 rounded-full"></div>
        </div>

        <p className="text-gray-500 text-sm mt-2">
          Estimated day: <span className="font-medium">Aug 27</span> (2 days left)
        </p>
      </div>
    </div>
  );
};

export default StudentDashboard;
