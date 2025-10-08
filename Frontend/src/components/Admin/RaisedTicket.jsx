import React, { useEffect, useState } from "react";
import {
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import ENV from "../../env";
import { toast } from "react-hot-toast";

const RaisedTicket = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({ status: "", remarks: "" });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

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
      setError("");
      const token = getAuthToken();

      const response = await axios.get(`${ENV.BASE_URL}/tickets/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const { success, data, message } = response.data;

      if (success) {
        const tickets = data?.tickets || [];
        const sortedTickets = sortTicketsByStatus(tickets);
        setTickets(sortedTickets);
        setFilteredTickets(sortedTickets);
      } else {
        throw new Error(message || "Failed to fetch tickets");
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);

      // Enhanced error handling
      let errorMessage = "Failed to fetch tickets";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.request) {
        errorMessage = "Network error - please check your connection";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter tickets based on search and status
  useEffect(() => {
    let filtered = tickets;

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ticket) =>
          ticket.subject.toLowerCase().includes(searchLower) ||
          ticket.description.toLowerCase().includes(searchLower) ||
          ticket.ticketId.toLowerCase().includes(searchLower) ||
          ticket.student?.studentName?.toLowerCase().includes(searchLower) ||
          ticket.student?.prn?.toLowerCase().includes(searchLower) ||
          ticket.department.toLowerCase().includes(searchLower) ||
          ticket.category.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, statusFilter]);

  // Update ticket status
  const updateTicketStatus = async (ticketId) => {
    try {
      const token = getAuthToken();
      const toastId = toast.loading("Updating ticket status...");

      const response = await axios.patch(
        `${ENV.BASE_URL}/tickets/${ticketId}/status`,
        statusUpdate,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { success, message } = response.data;

      if (success) {
        toast.success(message || "Ticket status updated successfully!", {
          id: toastId,
        });
        setSelectedTicket(null);
        setStatusUpdate({ status: "", remarks: "" });
        fetchTickets(); // Refresh the list
      } else {
        throw new Error(message || "Failed to update ticket");
      }
    } catch (err) {
      console.error("Error updating ticket:", err);

      let errorMessage = "Failed to update ticket status";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 404) {
        errorMessage = "Ticket not found";
      } else if (err.request) {
        errorMessage = "Network error - please check your connection";
      }

      toast.error(errorMessage);
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
      <>
        <div className="h-[20vh] bg-gray-50 p-6 pt-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-1/12 pl-5 bg-gray-200 rounded"></div>
            <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-5 w-1/2 pl-5 bg-gray-200 rounded"></div>
        </div>
        <div className="min-h-screen bg-gray-50 p-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="p-5 bg-white rounded-2xl shadow-md border border-gray-100 animate-pulse flex flex-col justify-between"
            >
              {/* Ticket info */}
              <div className="space-y-3 mb-4">
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </>
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
            className="bg-[#00539C] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-gray-300 focus:outline-none"
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
        <div className="bg-white rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
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
              className="text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:outline-none"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>

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

          {/* Search and Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets by subject, description, student name, PRN, department, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent focus:outline-none transition-all duration-200"
                />
              </div>
            </div>
            <div className="relative">
              <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent focus:outline-none appearance-none bg-white cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          {/* Status Summary */}
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClockIcon className="w-12 h-12 text-[#00539C]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {tickets.length === 0
                ? "No Tickets Found"
                : "No Matching Tickets"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {tickets.length === 0
                ? "There are currently no tickets assigned to your department. New tickets will appear here when students raise them."
                : "No tickets match your current search criteria. Try adjusting your filters."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header: Subject + Status */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
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

                {/* Ticket Info: Category, Ticket ID, Department */}
                <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-4">
                  <div className="flex gap-1">
                    <span className="font-medium">Ticket ID:</span>{" "}
                    {ticket.ticketId}
                  </div>
                  <div className="flex gap-1">
                    <span className="font-medium">Category:</span>{" "}
                    {ticket.category}
                  </div>
                  <div className="flex gap-1">
                    <span className="font-medium">Department:</span>{" "}
                    {ticket.department}
                  </div>
                </div>

                {/* Student Info */}
                {ticket.student && (
                  <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-4">
                    <div className="flex gap-1">
                      <span className="font-medium">Student:</span>{" "}
                      {ticket.student.studentName}
                    </div>
                    <div className="flex gap-1">
                      <span className="font-medium">PRN:</span>{" "}
                      {ticket.student.prn}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">Contact:</span>{" "}
                  {ticket.contactEmail}
                  {ticket.contactPhone && ` • ${ticket.contactPhone}`}
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-4 line-clamp-2">
                  {ticket.description}
                </p>

                {/* Footer: Created Date + Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pt-4 border-t border-gray-200">
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

                  <div className="flex flex-wrap gap-3">
                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="flex items-center gap-2 bg-[#00539C] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm focus:ring-2 focus:ring-gray-300 focus:outline-none"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Details
                    </button>

                    {/* Mark In Progress */}
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
                          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm focus:ring-2 focus:ring-gray-300 focus:outline-none"
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
                  className="text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-gray-300 focus:outline-none rounded-lg p-1"
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-300 focus:border-transparent focus:outline-none"
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-300 focus:border-transparent focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setSelectedTicket(null);
                          setStatusUpdate({ status: "", remarks: "" });
                        }}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-300 focus:outline-none"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          updateTicketStatus(selectedTicket.ticketId)
                        }
                        disabled={!statusUpdate.status}
                        className="px-6 py-2 bg-[#00539C] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-gray-300 focus:outline-none"
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
