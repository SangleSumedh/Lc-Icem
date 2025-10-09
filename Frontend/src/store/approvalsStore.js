// stores/useApprovalsStore.js
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
  errorStates: {
    pending: null,
    approved: null,
    rejected: null,
    requested: null,
  },

  fetchApprovals: async (tab, url, token) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, [tab]: true },
      errorStates: { ...state.errorStates, [tab]: null },
    }));

    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { success, data } = response.data;

      if (success) {
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
        throw new Error(data?.message || `Failed to fetch ${tab} approvals`);
      }
    } catch (err) {
      console.error(`Error fetching ${tab} approvals:`, err);
      set((state) => ({
        errorStates: {
          ...state.errorStates,
          [tab]: err.response?.data?.message || err.message,
        },
        approvalsData: { ...state.approvalsData, [tab]: [] },
      }));
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, [tab]: false },
      }));
    }
  },

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
      errorStates: { ...state.errorStates, [tab]: null },
    }));
  },

  // Optional: Add utility functions
  getApprovalsByTab: (tab) => get().approvalsData[tab],
  getLoadingByTab: (tab) => get().loadingStates[tab],
  getErrorByTab: (tab) => get().errorStates[tab],
}));

export default useApprovalsStore;
