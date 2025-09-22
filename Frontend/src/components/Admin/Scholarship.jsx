import React from "react";
import { Edit, Trash2, SortAsc } from "lucide-react";

function Scholarship() {
  const scholarships = [
    { name: "Merit Scholarship", amount: "₹25,000", status: "Open" },
    { name: "EBC Scholarship", amount: "₹15,000", status: "Closed" },
  ];

  return (
    <main className="flex-1 w-auto mx-auto px-6 lg:px-10 py-4">
      <div className="bg-white rounded-xl min-h-[90vh] shadow-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Scholarship Section</h2>
          <button className="flex items-center gap-2 font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-2 px-4 transition">
            <SortAsc size={18} /> Sort Scholarships
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {scholarships.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{s.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.status}</td>
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

export default Scholarship;
