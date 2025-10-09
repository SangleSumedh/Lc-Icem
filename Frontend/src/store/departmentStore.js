import { create } from "zustand";
import axios from "axios";
import ENV from "../env.js";

const useDepartmentStore = create((set, get) => ({
  // State
  departments: [],
  allStaff: [],
  loadingStates: {
    departments: false,
    staff: false,
    operations: false,
  },
  errorStates: {
    departments: null,
    staff: null,
  },
  hasFetched: false,
  isInitialized: false,

  // Actions
  fetchDepartments: async (token, forceRefresh = false) => {
    const { hasFetched, isInitialized } = get();

    // Don't fetch if we already have data and not forcing refresh
    if (hasFetched && !forceRefresh) {
      return;
    }

    set((state) => ({
      loadingStates: { ...state.loadingStates, departments: true },
      errorStates: { ...state.errorStates, departments: null },
    }));

    try {
      const [deptResponse, staffResponse] = await Promise.all([
        axios.get(`${ENV.BASE_URL}/admin/departments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${ENV.BASE_URL}/admin/staff`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!deptResponse.data.success) {
        throw new Error(
          deptResponse.data.message || "Failed to fetch departments"
        );
      }

      set({
        departments: deptResponse.data.data,
        allStaff: staffResponse.data.success ? staffResponse.data.data : [],
        hasFetched: true,
        isInitialized: true,
      });
    } catch (error) {
      console.error("Fetch data error:", error);
      set((state) => ({
        errorStates: { ...state.errorStates, departments: error.message },
        isInitialized: true,
      }));
      throw error;
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, departments: false },
      }));
    }
  },

  fetchStaff: async (token, forceRefresh = false) => {
    const { allStaff } = get();

    // Don't fetch if we already have staff data and not forcing refresh
    if (allStaff.length > 0 && !forceRefresh) {
      return;
    }

    set((state) => ({
      loadingStates: { ...state.loadingStates, staff: true },
      errorStates: { ...state.errorStates, staff: null },
    }));

    try {
      const response = await axios.get(`${ENV.BASE_URL}/admin/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        set({ allStaff: response.data.data });
      } else {
        throw new Error(response.data.message || "Failed to fetch staff");
      }
    } catch (error) {
      console.error("Fetch staff error:", error);
      set((state) => ({
        errorStates: { ...state.errorStates, staff: error.message },
      }));
      throw error;
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, staff: false },
      }));
    }
  },

  addDepartment: async (token, departmentData, staffData) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, operations: true },
    }));

    try {
      // 1. Add department
      const deptResponse = await axios.post(
        `${ENV.BASE_URL}/admin/add-department`,
        {
          ...departmentData,
          branchId: departmentData.branchId
            ? parseInt(departmentData.branchId)
            : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!deptResponse.data.success) {
        throw new Error(
          deptResponse.data.message || "Failed to add department"
        );
      }

      const deptId = deptResponse.data.data.deptId;

      // 2. Add staff if provided
      if (staffData.name && staffData.email && staffData.password) {
        await axios.post(
          `${ENV.BASE_URL}/admin/add-staff`,
          { ...staffData, deptId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // 3. Refresh data with force refresh
      await get().fetchDepartments(token, true);

      return deptResponse.data.data;
    } catch (error) {
      console.error("Add department error:", error);
      throw error;
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, operations: false },
      }));
    }
  },

  updateDepartment: async (token, departmentData) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, operations: true },
    }));

    try {
      // 1. Update department
      const deptPayload = {
        deptId: departmentData.deptId,
        college: departmentData.college,
        branchId: departmentData.branchId
          ? parseInt(departmentData.branchId)
          : null,
      };

      await axios.put(`${ENV.BASE_URL}/admin/update-department`, deptPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 3. Refresh data with force refresh
      await get().fetchDepartments(token, true);
    } catch (error) {
      console.error("Update department error:", error);
      throw error;
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, operations: false },
      }));
    }
  },

  deleteDepartment: async (token, deptId) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, operations: true },
    }));

    try {
      await axios.delete(`${ENV.BASE_URL}/admin/delete-department/${deptId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh data with force refresh
      await get().fetchDepartments(token, true);
    } catch (error) {
      console.error("Delete department error:", error);
      throw error;
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, operations: false },
      }));
    }
  },

  addStaff: async (token, staffData) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, operations: true },
    }));

    try {
      await axios.post(`${ENV.BASE_URL}/admin/add-staff`, staffData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh staff data with force refresh
      await get().fetchStaff(token, true);
    } catch (error) {
      console.error("Add staff error:", error);
      throw error;
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, operations: false },
      }));
    }
  },

  updateStaff: async (token, staffId, staffData) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, operations: true },
    }));

    try {
      const payload = {
        name: staffData.name,
        email: staffData.email,
        deptId: staffData.deptId,
      };

      if (staffData.password && staffData.password.trim() !== "") {
        payload.password = staffData.password;
      }

      await axios.put(
        `${ENV.BASE_URL}/admin/update-staff/${staffId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh staff data with force refresh
      await get().fetchStaff(token, true);
    } catch (error) {
      console.error("Update staff error:", error);
      throw error;
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, operations: false },
      }));
    }
  },

  deleteStaff: async (token, staffId) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, operations: true },
    }));

    try {
      await axios.delete(`${ENV.BASE_URL}/admin/delete-staff/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh staff data with force refresh
      await get().fetchStaff(token, true);
    } catch (error) {
      console.error("Delete staff error:", error);
      throw error;
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, operations: false },
      }));
    }
  },

  // Getters
  getDepartmentStats: () => {
    const { departments } = get();
    return departments.length;
  },

  getStaffByDepartment: (deptId) => {
    const { allStaff } = get();
    return allStaff.filter((staff) => staff.deptId === deptId);
  },

  shouldFetchInitially: () => {
    const { hasFetched, isInitialized } = get();
    return !isInitialized;
  },

  // Clear data (useful for logout)
  clearData: () => {
    set({
      departments: [],
      allStaff: [],
      hasFetched: false,
      isInitialized: false,
    });
  },

  // Clear errors
  clearErrors: () => {
    set({
      errorStates: { departments: null, staff: null },
    });
  },
}));

export default useDepartmentStore;
