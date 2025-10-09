import { create } from "zustand";
import axios from "axios";
import ENV from "../env.js";

const useSuperAdminStore = create((set, get) => ({
  // State
  superAdmins: [],
  loadingStates: {
    superAdmins: false,
    operations: false,
  },
  errorStates: {
    superAdmins: null,
  },
  hasFetched: false, // Add this flag to track if data has been fetched
  isInitialized: false,

  // Actions
  fetchSuperAdmins: async (token, forceRefresh = false) => {
    const { hasFetched } = get();

    // Don't fetch if we already have data and not forcing refresh
    if (hasFetched && !forceRefresh) {
      return;
    }

    set((state) => ({
      loadingStates: { ...state.loadingStates, superAdmins: true },
      errorStates: { ...state.errorStates, superAdmins: null },
    }));

    try {
      const response = await axios.get(
        `${ENV.BASE_URL}/admin/get-superAdmins`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const formattedData = response.data.data.map(
          ({ id, username, email }) => ({
            id,
            username,
            email,
          })
        );
        set({
          superAdmins: formattedData,
          hasFetched: true,
          isInitialized: true,
        });
      } else {
        throw new Error(
          response.data.message || "Failed to fetch super admins"
        );
      }
    } catch (error) {
      console.error("Fetch super admins error:", error);
      set((state) => ({
        errorStates: { ...state.errorStates, superAdmins: error.message },
        isInitialized: true,
      }));
      throw error;
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, superAdmins: false },
      }));
    }
  },

  addSuperAdmin: async (token, adminData) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, operations: true },
    }));

    try {
      const response = await axios.post(
        `${ENV.BASE_URL}/admin/add-superadmin`,
        adminData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to add super admin");
      }

      // Refresh data
      await get().fetchSuperAdmins(token, true); // Force refresh after adding
      return response.data.data;
    } catch (error) {
      console.error("Add super admin error:", error);
      throw error;
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, operations: false },
      }));
    }
  },

  updateSuperAdmin: async (token, id, adminData) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, operations: true },
    }));

    try {
      const payload = {
        username: adminData.username,
        email: adminData.email,
      };

      // Only include password if provided
      if (adminData.password && adminData.password.trim() !== "") {
        payload.password = adminData.password;
      }

      const response = await axios.put(
        `${ENV.BASE_URL}/admin/update-superadmin/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to update super admin"
        );
      }

      // Refresh data
      await get().fetchSuperAdmins(token, true); // Force refresh after updating
    } catch (error) {
      console.error("Update super admin error:", error);
      throw error;
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, operations: false },
      }));
    }
  },

  deleteSuperAdmin: async (token, id) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, operations: true },
    }));

    try {
      const response = await axios.delete(
        `${ENV.BASE_URL}/admin/delete-superadmin/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete super admin"
        );
      }

      // Refresh data
      await get().fetchSuperAdmins(token, true); // Force refresh after deleting
    } catch (error) {
      console.error("Delete super admin error:", error);
      throw error;
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, operations: false },
      }));
    }
  },

  // Getters
  getSuperAdminStats: () => {
    const { superAdmins } = get();
    return superAdmins.length;
  },

  shouldFetchInitially: () => {
    const { hasFetched, isInitialized } = get();
    return !isInitialized; // Only fetch initially if not initialized
  },

  // Clear data (useful for logout)
  clearData: () => {
    set({
      superAdmins: [],
      hasFetched: false,
    });
  },

  // Clear errors
  clearErrors: () => {
    set({
      errorStates: { superAdmins: null },
    });
  },
}));

export default useSuperAdminStore;
