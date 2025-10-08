import { create } from "zustand";
import axios from "axios";

const useApprovalsStore = create((set, get) => ({
  approvalsData: {
    pending: [],
    approved: [],
    rejected: [],
    requested: [],
  },
  loadingStates: {
    pending: false,
    approved: false,
    rejected: false,
    requested: false,
  },

  fetchApprovals: async (tab, url, token) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, [tab]: true },
    }));

    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { success, data } = response.data;

      if (success) {
        // Handle different response field names for different tabs
        let approvals = [];

        switch (tab) {
          case "pending":
            approvals = data?.pendingApprovals || data?.approvals || [];
            break;
          case "approved":
            approvals = data?.approvedApprovals || data?.approvals || [];
            break;
          case "rejected":
            approvals = data?.rejectedApprovals || data?.approvals || [];
            break;
          case "requested":
            approvals = data?.requestedInfoApprovals || data?.approvals || [];
            break;
          default:
            approvals = data?.approvals || [];
        }

        set((state) => ({
          approvalsData: {
            ...state.approvalsData,
            [tab]: approvals,
          },
        }));
      } else {
        set((state) => ({
          approvalsData: { ...state.approvalsData, [tab]: [] },
        }));
      }
    } catch (err) {
      console.error(`Error fetching ${tab} approvals:`, err);
      set((state) => ({
        approvalsData: { ...state.approvalsData, [tab]: [] },
      }));
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, [tab]: false },
      }));
    }
  },

  // Add updateApproval function that's missing from your store
  updateApproval: async (url, token, updateData) => {
    try {
      const response = await axios.post(url, updateData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const { success, message } = response.data;
      return { success, message };
    } catch (err) {
      console.error("Error updating approval:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Error updating approval",
      };
    }
  },

  clearTab: (tab) => {
    set((state) => ({
      approvalsData: { ...state.approvalsData, [tab]: [] },
    }));
  },
}));

export default useApprovalsStore;
