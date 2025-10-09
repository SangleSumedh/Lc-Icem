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
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { jwtDecode } from "jwt-decode";
import ENV from "../../env";
import { toast } from "react-hot-toast";

function StudentTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const getStudentPrn = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.prn || decoded.sub || null;
    } catch (err) {
      console.error("Error decoding JWT:", err);
      return null;
    }
  };

  const getAuthToken = () => localStorage.getItem("token");

  const fetchStudentTickets = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const prn = getStudentPrn();
      if (!prn) {
        setError("Student PRN not found. Please log in again.");
        toast.error("Student PRN not found. Please log in again.");
        return;
      }
      const response = await axios.get(
        `${ENV.BASE_URL}/tickets/student/${prn}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { success, data, message } = response.data;
      if (success) setTickets(data?.tickets || []);
      else throw new Error(message || "Failed to fetch tickets");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch tickets"
      );
      toast.error(
        err.response?.data?.message || err.message || "Failed to fetch tickets"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTickets = async () => {
      await fetchStudentTickets();
    };
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-red-50 text-red-700 border-red-200";
      case "IN_PROGRESS":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "RESOLVED":
        return "bg-green-50 text-green-700 border-green-200";
      case "CLOSED":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

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

  const getPriorityBadge = (priority) => {
    const config = {
      LOW: "bg-gray-100 text-gray-700",
      MEDIUM: "bg-blue-100 text-blue-700",
      HIGH: "bg-amber-100 text-amber-700",
      URGENT: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          config[priority] || config.MEDIUM
        }`}
      >
        {priority}
      </span>
    );
  };

 if (loading) {
   return (
     <div className="min-h-screen bg-gray-50 p-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
       {[...Array(6)].map((_, i) => (
         <div
           key={i}
           className="p-5 bg-white rounded-2xl shadow-md border border-gray-100 animate-pulse flex flex-col justify-between"
         >
           {/* Header */}
           <div className="flex items-center justify-between mb-4">
             <div className="h-5 w-2/3 bg-gray-200 rounded"></div>
             <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
           </div>

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
   );
 }

  if (error)
    return <ErrorView fetchTickets={fetchStudentTickets} message={error} />;

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#00539C] rounded-2xl">
              <AcademicCapIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#00539C]">
                My Support Tickets
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-lg">
                Track all your support requests in one place
              </p>
            </div>
          </div>
          <button
            onClick={fetchStudentTickets}
            className="flex items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
            title="Refresh tickets"
          >
            <ArrowPathIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Search + Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="relative lg:col-span-2">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-gray-400 focus:border-gray-400 focus:outline-none transition-all duration-200 hover:shadow-xl"
            />
          </div>
          <div>
            <button
              onClick={() => setStatusModalOpen(true)}
              className="w-full px-4 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl text-left hover:shadow-xl flex justify-between items-center"
            >
              {statusFilter === "ALL"
                ? "All Status"
                : statusFilter.replace("_", " ")}
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-400" />
            </button>

            {/* Modal */}
            {statusModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-2xl p-6 w-80 max-w-full">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Select Status
                  </h3>
                  <div className="flex flex-col gap-3">
                    {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status);
                            setStatusModalOpen(false);
                          }}
                          className="w-full px-4 py-2 rounded-xl text-gray-700 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 focus:outline-none hover:bg-gray-100 font-medium"
                        >
                          {status === "ALL"
                            ? "All Status"
                            : status.replace("_", " ")}
                        </button>
                      )
                    )}
                  </div>
                  <button
                    onClick={() => setStatusModalOpen(false)}
                    className="mt-4 w-full px-4 py-2 rounded-xl bg-red-100 text-red-700 font-medium hover:bg-red-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tickets */}
        {filteredTickets.length === 0 ? (
          <NoTickets tickets={tickets} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-3xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300 hover:border-blue-200 cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {ticket.subject}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      ticket.status
                    )}`}
                  >
                    {getStatusIcon(ticket.status)}{" "}
                    {ticket.status.replace("_", " ")}
                  </span>
                  {ticket.priority && getPriorityBadge(ticket.priority)}
                </div>
                <p className="text-gray-700 line-clamp-3 mb-2">
                  {ticket.description}
                </p>
                <p className="text-sm text-gray-500 font-mono">
                  ID: {ticket.ticketId}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          close={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}

// ✅ Subcomponents for clarity
const LoadingSkeleton = () => (
  <div className="min-h-screen p-6 bg-gray-50 animate-pulse">
    Loading tickets...
  </div>
);
const ErrorView = ({ fetchTickets, message }) => (
  <div className="min-h-[60vh] bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
    <div className="text-center max-w-md">
      <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-3">
        Unable to Load Tickets
      </h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <button
        onClick={fetchTickets}
        className="bg-[#00539C] text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg"
      >
        Try Again
      </button>
    </div>
  </div>
);
const NoTickets = ({ tickets }) => (
  <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center">
    <ClockIcon className="w-12 h-12 text-[#00539C] mx-auto mb-4" />
    <h3 className="text-2xl font-bold text-gray-900 mb-3">
      {tickets.length === 0 ? "No Tickets Found" : "No Matching Tickets"}
    </h3>
    <p className="text-gray-600 max-w-md mx-auto text-lg mb-8">
      {tickets.length === 0
        ? "You haven't raised any support tickets yet."
        : "No tickets match your search."}
    </p>
  </div>
);

const TicketModal = ({ ticket, close }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[#00539C]">Ticket Details</h2>
        <button onClick={close} className="text-gray-500 hover:text-gray-700">
          <XCircleIcon className="w-8 h-8" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-700">Subject</h3>
          <p className="bg-gray-50 rounded-xl p-3">{ticket.subject}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-700">Description</h3>
          <p className="bg-gray-50 rounded-xl p-3 whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-700">Category</h3>
            <p className="bg-gray-50 rounded-xl p-2">{ticket.category}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Department</h3>
            <p className="bg-gray-50 rounded-xl p-2">{ticket.department}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default StudentTickets;
