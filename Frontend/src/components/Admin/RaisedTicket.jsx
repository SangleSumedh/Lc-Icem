import React, { useEffect, useState } from "react";
import {
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import ENV from "../../env";

const RaisedTicket = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({ status: "", remarks: "" });

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Sort tickets by status priority
  const sortTicketsByStatus = (tickets) => {
    const statusPriority = {
      IN_PROGRESS: 1,
      OPEN: 2,
      RESOLVED: 3,
      CLOSED: 4,
    };

    return [...tickets].sort((a, b) => {
      return statusPriority[a.status] - statusPriority[b.status];
    });
  };

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await axios.get(
        `${ENV.BASE_URL}/tickets/` || "http://localhost:5000/tickets/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const sortedTickets = sortTicketsByStatus(response.data.tickets || []);
        setTickets(sortedTickets);
      } else {
        throw new Error(response.data.error || "Failed to fetch tickets");
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update ticket status
  const updateTicketStatus = async (ticketId) => {
    try {
      const token = getAuthToken();

      const response = await axios.patch(
        `${ENV.BASE_URL}/tickets/${ticketId}/status` ||
          `http://localhost:5000/tickets/${ticketId}/status`,
        statusUpdate,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        alert("Ticket status updated successfully!");
        setSelectedTicket(null);
        setStatusUpdate({ status: "", remarks: "" });
        fetchTickets(); // Refresh the list (will re-sort)
      } else {
        throw new Error(response.data.error || "Failed to update ticket");
      }
    } catch (err) {
      console.error("Error updating ticket:", err);
      alert(`Error: ${err.response?.data?.error || err.message}`);
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

  // Get status count for each category
  const getStatusCounts = () => {
    const counts = {
      IN_PROGRESS: 0,
      OPEN: 0,
      RESOLVED: 0,
      CLOSED: 0,
    };

    tickets.forEach((ticket) => {
      if (counts.hasOwnProperty(ticket.status)) {
        counts[ticket.status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  useEffect(() => {
    fetchTickets();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00539C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="w-8 h-8 text-rose-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Tickets
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTickets}
            className="bg-[#00539C] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl px-2 py-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#00539C] mb-2">
                Tickets
              </h1>
              <p className="text-gray-600">
                Manage and resolve support tickets assigned to your department
              </p>
            </div>
            <button
              onClick={fetchTickets}
              className="text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Status Summary */}
          {tickets.length > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-700">
                  {statusCounts.IN_PROGRESS}
                </div>
                <div className="text-sm text-amber-600">In Progress</div>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-rose-700">
                  {statusCounts.OPEN}
                </div>
                <div className="text-sm text-rose-600">Open</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-emerald-700">
                  {statusCounts.RESOLVED}
                </div>
                <div className="text-sm text-emerald-600">Resolved</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-slate-700">
                  {statusCounts.CLOSED}
                </div>
                <div className="text-sm text-slate-600">Closed</div>
              </div>
            </div>
          )}
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
              There are currently no tickets assigned to your department. New
              tickets will appear here when students raise them.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {ticket.subject}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {getStatusIcon(ticket.status)}
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Category:</span>{" "}
                        {ticket.category}
                      </div>
                      <div>
                        <span className="font-medium">Ticket ID:</span>{" "}
                        {ticket.ticketId}
                      </div>
                      <div>
                        <span className="font-medium">Department:</span>{" "}
                        {ticket.department}
                      </div>
                    </div>

                    {ticket.student && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Student:</span>{" "}
                          {ticket.student.studentName}
                        </div>
                        <div>
                          <span className="font-medium">PRN:</span>{" "}
                          {ticket.student.prn}
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-gray-600 mb-4">
                      <span className="font-medium">Contact:</span>{" "}
                      {ticket.contactEmail}
                      {ticket.contactPhone && ` • ${ticket.contactPhone}`}
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Created:{" "}
                    {new Date(ticket.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="flex items-center gap-2 bg-[#00539C] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Details
                    </button>

                    {ticket.status !== "CLOSED" &&
                      ticket.status !== "RESOLVED" && (
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setStatusUpdate({
                              status: "IN_PROGRESS",
                              remarks: "",
                            });
                          }}
                          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                          Mark In Progress
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/30 shadow-2xl backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50 border border-gray-500">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-[#00539C]">
                  Ticket Details
                </h2>
                <button
                  onClick={() => {
                    setSelectedTicket(null);
                    setStatusUpdate({ status: "", remarks: "" });
                  }}
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

                {selectedTicket.student && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Student Name
                      </label>
                      <p className="text-gray-900">
                        {selectedTicket.student.studentName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PRN
                      </label>
                      <p className="text-gray-900">
                        {selectedTicket.student.prn}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <p className="text-gray-900">{selectedTicket.category}</p>
                  </div>
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

                {/* Status Update Section */}
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Update Ticket Status
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Status
                      </label>
                      <select
                        value={statusUpdate.status}
                        onChange={(e) =>
                          setStatusUpdate((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1  focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
                      >
                        <option value="">Select status</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Remarks (Optional)
                      </label>
                      <textarea
                        value={statusUpdate.remarks}
                        onChange={(e) =>
                          setStatusUpdate((prev) => ({
                            ...prev,
                            remarks: e.target.value,
                          }))
                        }
                        placeholder="Add any remarks or notes about this status update..."
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1  focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setSelectedTicket(null);
                          setStatusUpdate({ status: "", remarks: "" });
                        }}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          updateTicketStatus(selectedTicket.ticketId)
                        }
                        disabled={!statusUpdate.status}
                        className="px-6 py-2 bg-[#00539C] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RaisedTicket;
