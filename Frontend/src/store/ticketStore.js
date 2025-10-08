import { create } from "zustand";
import axios from "axios";
import ENV from "../env";

const useTicketStore = create((set, get) => ({
  // Tickets data
  tickets: [],
  filteredTickets: [],

  // Loading states
  loadingStates: {
    tickets: false,
    update: false,
  },

  // Error states
  errorStates: {
    tickets: null,
    update: null,
  },

  // Search and filter states
  filters: {
    searchTerm: "",
    statusFilter: "ALL",
  },

  // Prevent refetching on remounts
  hasFetched: false,
  isInitialized: false,

  // Get auth token from localStorage
  getAuthToken: () => {
    return localStorage.getItem("token");
  },

  // Sort tickets by status priority
  sortTicketsByStatus: (tickets) => {
    const statusPriority = {
      IN_PROGRESS: 1,
      OPEN: 2,
      RESOLVED: 3,
      CLOSED: 4,
    };

    return [...tickets].sort((a, b) => {
      return statusPriority[a.status] - statusPriority[b.status];
    });
  },

  // Fetch all tickets
  fetchTickets: async (forceRefresh = false) => {
    const { hasFetched } = get();

    // Don't fetch if we already have data and not forcing refresh
    if (hasFetched && !forceRefresh) {
      return;
    }

    set((state) => ({
      loadingStates: { ...state.loadingStates, tickets: true },
      errorStates: { ...state.errorStates, tickets: null },
    }));

    try {
      const token = get().getAuthToken();

      const response = await axios.get(`${ENV.BASE_URL}/tickets/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const { success, data, message } = response.data;

      if (success) {
        const tickets = data?.tickets || [];
        const sortedTickets = get().sortTicketsByStatus(tickets);

        set({
          tickets: sortedTickets,
          filteredTickets: sortedTickets,
          hasFetched: true,
          isInitialized: true,
        });

        // Apply existing filters to new tickets
        get().applyFilters();
      } else {
        throw new Error(message || "Failed to fetch tickets");
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);

      let errorMessage = "Failed to fetch tickets";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.request) {
        errorMessage = "Network error - please check your connection";
      }

      set((state) => ({
        errorStates: { ...state.errorStates, tickets: errorMessage },
        isInitialized: true,
      }));
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, tickets: false },
      }));
    }
  },

  // Update ticket status
  updateTicketStatus: async (ticketId, statusUpdate) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, update: true },
      errorStates: { ...state.errorStates, update: null },
    }));

    try {
      const token = get().getAuthToken();

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
        // Refresh tickets after successful update (force refresh)
        await get().fetchTickets(true);
        return { success: true, message };
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

      set((state) => ({
        errorStates: { ...state.errorStates, update: errorMessage },
      }));

      return { success: false, error: errorMessage };
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, update: false },
      }));
    }
  },

  // Apply filters to tickets
  applyFilters: () => {
    const { tickets, filters } = get();
    let filtered = tickets;

    // Apply status filter
    if (filters.statusFilter !== "ALL") {
      filtered = filtered.filter(
        (ticket) => ticket.status === filters.statusFilter
      );
    }

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
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

    set({ filteredTickets: filtered });
  },

  // Set search term
  setSearchTerm: (searchTerm) => {
    set((state) => ({
      filters: { ...state.filters, searchTerm },
    }));
    get().applyFilters();
  },

  // Set status filter
  setStatusFilter: (statusFilter) => {
    set((state) => ({
      filters: { ...state.filters, statusFilter },
    }));
    get().applyFilters();
  },

  // Get status counts - FIXED: Remove duplicate definition
  getStatusCountsData: () => {
    const { tickets } = get();
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
  },

  // Check if we should fetch initially
  shouldFetchInitially: () => {
    const { hasFetched, isInitialized } = get();
    return !isInitialized;
  },

  // Clear data (useful for logout)
  clearData: () => {
    set({
      tickets: [],
      filteredTickets: [],
      filters: {
        searchTerm: "",
        statusFilter: "ALL",
      },
      hasFetched: false,
      isInitialized: false,
    });
  },

  // Clear errors
  clearErrors: () => {
    set({
      errorStates: { tickets: null, update: null },
    });
  },

  // Utility functions - REMOVE the duplicate getStatusCountsData from here
  getTickets: () => get().tickets,
  getFilteredTickets: () => get().filteredTickets,
  getFilters: () => get().filters,
  getLoading: (type) => get().loadingStates[type],
  getError: (type) => get().errorStates[type],
  // REMOVED: getStatusCountsData: () => get().getStatusCountsData(), // This was causing infinite recursion
}));

export default useTicketStore;
