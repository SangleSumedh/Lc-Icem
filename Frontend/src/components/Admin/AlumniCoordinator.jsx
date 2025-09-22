import React from "react";
import { Edit, Trash2, SortAsc } from "lucide-react";

function AlumniCoordinator() {
  const alumni = [
    { name: "Rahul Patil", batch: "2022", alumniID: "ALU001", contact: "rahul@example.com" },
    { name: "Sneha Sharma", batch: "2021", alumniID: "ALU002", contact: "sneha@example.com" },
  ];

  return (
    <main className="flex-1 w-auto mx-auto px-6 lg:px-10 py-4">
      <div className="bg-white rounded-xl min-h-[90vh] shadow-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Alumni Coordinator</h2>
          <button className="flex items-center gap-2 font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-2 px-4 transition">
            <SortAsc size={18} /> Sort Alumni
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Batch</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Alumni ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {alumni.map((a, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{a.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.batch}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.alumniID}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.contact}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button className="p-2 rounded-lg text-blue-600 hover:bg-blue-200"><Edit size={18} /></button>
                    <button className="p-2 rounded-lg text-red-600 hover:bg-red-200"><Trash2 size={18} /></button>
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

export default AlumniCoordinator;
