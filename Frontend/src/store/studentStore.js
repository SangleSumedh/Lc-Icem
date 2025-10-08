import { create } from "zustand";
import axios from "axios";
import ENV from "../env";

const useStudentStore = create((set, get) => ({
  // State
  students: [],
  loadingStates: {
    students: false,
    operations: false,
  },
  errorStates: {
    students: null,
  },
  hasFetched: false,
  isInitialized: false,

  // Actions
  fetchStudents: async (token, forceRefresh = false) => {
    const { hasFetched, isInitialized } = get();

    // Don't fetch if we already have data and not forcing refresh
    if (hasFetched && !forceRefresh) {
      return;
    }

    set((state) => ({
      loadingStates: { ...state.loadingStates, students: true },
      errorStates: { ...state.errorStates, students: null },
    }));

    try {
      const response = await axios.get(`${ENV.BASE_URL}/admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        set({
          students: response.data.data,
          hasFetched: true,
          isInitialized: true,
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch students");
      }
    } catch (error) {
      console.error("Fetch students error:", error);
      set((state) => ({
        errorStates: { ...state.errorStates, students: error.message },
        isInitialized: true,
      }));
      throw error;
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, students: false },
      }));
    }
  },

  addStudent: async (token, studentData) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, operations: true },
    }));

    try {
      const response = await axios.post(
        `${ENV.BASE_URL}/admin/add-student`,
        studentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to add student");
      }

      // Refresh data with force refresh
      await get().fetchStudents(token, true);
      return response.data.data;
    } catch (error) {
      console.error("Add student error:", error);
      throw error;
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, operations: false },
      }));
    }
  },

  updateStudent: async (token, prn, studentData) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, operations: true },
    }));

    try {
      const payload = {
        studentName: studentData.studentName,
        email: studentData.email,
        phoneNo: studentData.phoneNo,
        college: studentData.college,
      };

      // Only include password if provided
      if (studentData.password && studentData.password.trim() !== "") {
        payload.password = studentData.password;
      }

      const response = await axios.put(
        `${ENV.BASE_URL}/admin/update-student/${prn}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update student");
      }

      // Refresh data with force refresh
      await get().fetchStudents(token, true);
    } catch (error) {
      console.error("Update student error:", error);
      throw error;
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, operations: false },
      }));
    }
  },

  deleteStudent: async (token, prn) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, operations: true },
    }));

    try {
      const response = await axios.delete(
        `${ENV.BASE_URL}/admin/delete-student/${prn}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete student");
      }

      // Refresh data with force refresh
      await get().fetchStudents(token, true);
    } catch (error) {
      console.error("Delete student error:", error);
      throw error;
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, operations: false },
      }));
    }
  },

  // Getters
  getStudentStats: () => {
    const { students } = get();
    return students.length;
  },

  getStudentsByCollege: (college) => {
    const { students } = get();
    if (!college) return students;
    return students.filter((student) => student.college === college);
  },

  shouldFetchInitially: () => {
    const { hasFetched, isInitialized } = get();
    return !isInitialized;
  },

  // Clear data (useful for logout)
  clearData: () => {
    set({
      students: [],
      hasFetched: false,
      isInitialized: false,
    });
  },

  // Clear errors
  clearErrors: () => {
    set({
      errorStates: { students: null },
    });
  },
}));

export default useStudentStore;
