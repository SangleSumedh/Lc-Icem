import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AcademicCapIcon,
  UserCircleIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  CheckCircleIcon,
  EyeIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { jwtDecode } from "jwt-decode";
import ENV from "../../env";

function StudentTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Get student PRN from localStorage (assuming it's stored during login)

  const getStudentPrn = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded.prn || decoded.sub || null; // adjust according to your JWT payload
    } catch (err) {
      console.error("Error decoding JWT:", err);
      return null;
    }
  };

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Fetch student's tickets
  const fetchStudentTickets = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const prn = getStudentPrn();
      console.log(prn);

      if (!prn) {
        setError("Student PRN not found. Please log in again.");
        return;
      }

      const response = await axios.get(
        `${ENV.BASE_URL}/tickets/student/${prn}` ||
          `http://localhost:5000/tickets/student/${prn}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setTickets(response.data.tickets || []);
      } else {
        throw new Error(response.data.error || "Failed to fetch tickets");
      }
    } catch (err) {
      console.error("Error fetching student tickets:", err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "IN_PROGRESS":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "RESOLVED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "CLOSED":
        return "bg-slate-100 text-slate-800 border-slate-200";
      default:
        return "bg-sky-100 text-sky-800 border-sky-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "OPEN":
        return <ClockIcon className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <ArrowPathIcon className="w-4 h-4" />;
      case "RESOLVED":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "CLOSED":
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    fetchStudentTickets();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[90vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="w-8 h-8 text-rose-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Tickets
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStudentTickets}
            className="bg-[#00539C] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-gray-50 p-6">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl px-6 py-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#00539C] mb-2">
                My Support Tickets
              </h1>
              <p className="text-gray-600">
                View and track all your support ticket requests
              </p>
            </div>
            <button
              onClick={fetchStudentTickets}
              className="text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 hover:bg-gray-50"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tickets Grid */}
        {tickets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClockIcon className="w-12 h-12 text-[#00539C]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Tickets Found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              You haven't raised any support tickets yet.
              <br />
              Create your first ticket to get help with any issues.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-200"
              >
                {/* Header Section */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {ticket.subject}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {getStatusIcon(ticket.status)}
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>

                    {/* Ticket Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-gray-500">
                            Category:
                          </span>
                          <p className="text-gray-800 mt-0.5">
                            {ticket.category}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">
                            Ticket ID:
                          </span>
                          <p className="text-gray-800 mt-0.5 font-mono">
                            {ticket.ticketId}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">
                          Department:
                        </span>
                        <p className="text-gray-800 mt-0.5">
                          {ticket.department}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <p className="text-gray-700 line-clamp-3 text-sm leading-relaxed">
                        {ticket.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-100 gap-3">
                  <div className="text-sm text-gray-500">
                    <div className="flex flex-wrap items-center gap-2">
                      <span>
                        Created:{" "}
                        {new Date(ticket.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                      {ticket.closedAt && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span>
                            Closed:{" "}
                            {new Date(ticket.closedAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="flex items-center gap-2 bg-[#00539C] text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/30  shadow-2xl backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] border-2 border-gray-300 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-[#00539C]">
                  Ticket Details
                </h2>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <p className="text-gray-900">{selectedTicket.subject}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Status
                    </label>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        selectedTicket.status
                      )}`}
                    >
                      {getStatusIcon(selectedTicket.status)}
                      {selectedTicket.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <p className="text-gray-900">{selectedTicket.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <p className="text-gray-900">{selectedTicket.department}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ticket ID
                    </label>
                    <p className="text-gray-900 font-mono">
                      {selectedTicket.ticketId}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <p className="text-gray-900">
                      {selectedTicket.contactEmail}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <p className="text-gray-900">
                      {selectedTicket.contactPhone || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created Date
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedTicket.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  {selectedTicket.updatedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Updated
                      </label>
                      <p className="text-gray-900">
                        {new Date(selectedTicket.updatedAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {selectedTicket.relatedTo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Related To
                    </label>
                    <p className="text-gray-900">{selectedTicket.relatedTo}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentTickets;
