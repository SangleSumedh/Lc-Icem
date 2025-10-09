// stores/useAdminStore.js
import { create } from "zustand";
import axios from "axios";
import ENV from "../env";

const useAdminStore = create((set, get) => ({
  // Admin Stats
  stats: {
    students: 0,
    departments: 0,
    superadmins: 0,
    loginLogs: 0,
  },

  // Login Logs
  loginLogs: [],

  // Loading States
  loadingStates: {
    stats: false,
    loginLogs: false,
    allData: false,
  },

  // Error States
  errorStates: {
    stats: null,
    loginLogs: null,
    allData: null,
  },

  // Prevent refetching on remounts
  hasFetched: {
    stats: false,
    loginLogs: false,
  },
  isInitialized: {
    stats: false,
    loginLogs: false,
  },

  // Fetch admin stats
  fetchStats: async (token, forceRefresh = false) => {
    const { hasFetched } = get();

    // Don't fetch if we already have data and not forcing refresh
    if (hasFetched.stats && !forceRefresh) {
      return;
    }

    set((state) => ({
      loadingStates: { ...state.loadingStates, stats: true },
      errorStates: { ...state.errorStates, stats: null },
    }));

    try {
      const [studentsRes, departmentsRes, superadminsRes] = await Promise.all([
        axios.get(`${ENV.BASE_URL}/admin/students`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${ENV.BASE_URL}/admin/departments`),
        axios.get(`${ENV.BASE_URL}/admin/get-superAdmins`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const statsData = {
        students: studentsRes.data?.data?.length || 0,
        departments: departmentsRes.data?.data?.length || 0,
        superadmins: superadminsRes.data?.data?.length || 0,
        loginLogs: get().loginLogs.length,
      };

      set({
        stats: statsData,
        hasFetched: { ...hasFetched, stats: true },
        isInitialized: { ...get().isInitialized, stats: true },
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      set((state) => ({
        errorStates: { ...state.errorStates, stats: err.message },
        isInitialized: { ...state.isInitialized, stats: true },
      }));
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, stats: false },
      }));
    }
  },

  // Fetch login logs
  fetchLoginLogs: async (token, forceRefresh = false) => {
    const { hasFetched } = get();

    // Don't fetch if we already have data and not forcing refresh
    if (hasFetched.loginLogs && !forceRefresh) {
      return;
    }

    set((state) => ({
      loadingStates: { ...state.loadingStates, loginLogs: true },
      errorStates: { ...state.errorStates, loginLogs: null },
    }));

    try {
      const response = await axios.get(
        `${ENV.BASE_URL}/admin/staff-login-logs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const loginLogsData = response.data.data || [];
        set({
          loginLogs: loginLogsData,
          stats: {
            ...get().stats,
            loginLogs: loginLogsData.length,
          },
          hasFetched: { ...hasFetched, loginLogs: true },
          isInitialized: { ...get().isInitialized, loginLogs: true },
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch login logs");
      }
    } catch (err) {
      console.error("Error fetching login logs:", err);
      set((state) => ({
        errorStates: { ...state.errorStates, loginLogs: err.message },
        isInitialized: { ...state.isInitialized, loginLogs: true },
      }));
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, loginLogs: false },
      }));
    }
  },

  // Fetch all admin data
  fetchAllAdminData: async (token, forceRefresh = false) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, allData: true },
      errorStates: { ...state.errorStates, allData: null },
    }));

    try {
      await Promise.all([
        get().fetchStats(token, forceRefresh),
        get().fetchLoginLogs(token, forceRefresh),
      ]);
    } catch (err) {
      console.error("Error fetching all admin data:", err);
      set((state) => ({
        errorStates: { ...state.errorStates, allData: err.message },
      }));
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, allData: false },
      }));
    }
  },

  // Check if we should fetch initially
  shouldFetchInitially: () => {
    const { isInitialized } = get();
    return {
      stats: !isInitialized.stats,
      loginLogs: !isInitialized.loginLogs,
      allData: !isInitialized.stats || !isInitialized.loginLogs,
    };
  },

  // Clear specific data
  clearData: (type) => {
    if (type === "loginLogs") {
      set({
        loginLogs: [],
        hasFetched: { ...get().hasFetched, loginLogs: false },
        isInitialized: { ...get().isInitialized, loginLogs: false },
      });
    } else if (type === "stats") {
      set({
        stats: { students: 0, departments: 0, superadmins: 0, loginLogs: 0 },
        hasFetched: { ...get().hasFetched, stats: false },
        isInitialized: { ...get().isInitialized, stats: false },
      });
    } else if (type === "all") {
      set({
        stats: { students: 0, departments: 0, superadmins: 0, loginLogs: 0 },
        loginLogs: [],
        hasFetched: { stats: false, loginLogs: false },
        isInitialized: { stats: false, loginLogs: false },
      });
    }
  },

  // Clear errors
  clearErrors: () => {
    set({
      errorStates: { stats: null, loginLogs: null, allData: null },
    });
  },

  // Utility functions
  getStats: () => get().stats,
  getLoginLogs: () => get().loginLogs,
  getLoading: (type) => get().loadingStates[type],
  getError: (type) => get().errorStates[type],
}));

export default useAdminStore;
