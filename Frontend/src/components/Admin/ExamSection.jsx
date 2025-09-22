import React from "react";
import { Edit, Trash2, SortAsc } from "lucide-react";

function ExamSection() {
  const exams = [
    { exam: "Mid-Sem", date: "2025-03-15", status: "Scheduled" },
    { exam: "End-Sem", date: "2025-06-01", status: "Upcoming" },
  ];

  return (
    <main className="flex-1 w-auto mx-auto px-6 lg:px-10 py-4">
      <div className="bg-white rounded-xl min-h-[90vh] shadow-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Exam Section</h2>
          <button className="flex items-center gap-2 font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-2 px-4 transition">
            <SortAsc size={18} /> Sort Exams
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Exam</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {exams.map((e, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{e.exam}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{e.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{e.status}</td>
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

export default ExamSection;
