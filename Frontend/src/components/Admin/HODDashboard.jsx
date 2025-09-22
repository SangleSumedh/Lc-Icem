import React from "react";
import { SortAsc, Edit, Trash2 } from "lucide-react";

function HODDashboard() {
  const students = [
    {
      studentName: "Sumedh Sangle",
      batch: "2025",
      studentID: "STU001",
      dept: "Computer",
    },
    {
      studentName: "Aarav Mehta",
      batch: "2024",
      studentID: "STU002",
      dept: "IT",
    },
    {
      studentName: "Priya Sharma",
      batch: "2025",
      studentID: "STU003",
      dept: "Mechanical",
    },
    {
      studentName: "Rohan Gupta",
      batch: "2023",
      studentID: "STU004",
      dept: "ENTC",
    },
  ];

  return (
    <main className="flex-1 w-auto mx-auto  px-6 lg:px-10 py-4">
      <div className="bg-white rounded-xl min-h-[90vh] w-full shadow-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">HOD Dashboard</h2>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Pending Approvals for Leaving Certificate
          </h2>
          <button className="flex items-center gap-2 font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-2 px-4 transition">
            <SortAsc size={18} />
            Sort Requests
          </button>
        </div>

        {/* Students Table */}
        <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Dept
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {students.map((s, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {s.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {s.batch}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {s.studentID}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {s.dept}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button className="p-2 rounded-lg text-blue-600 hover:bg-blue-200 transition">
                      <Edit size={18} />
                    </button>
                    <button className="p-2 rounded-lg text-red-600 hover:bg-red-200 transition">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

export default HODDashboard;
