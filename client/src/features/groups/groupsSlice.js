import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Async thunks
export const fetchGroups = createAsyncThunk(
  "groups/fetchGroups",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/groups");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch groups"
      );
    }
  }
);

export const fetchGroupDetails = createAsyncThunk(
  "groups/fetchGroupDetails",
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/groups/${groupId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch group details"
      );
    }
  }
);

export const fetchGroupNotes = createAsyncThunk(
  "groups/fetchGroupNotes",
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/groups/${groupId}/notes`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch group notes"
      );
    }
  }
);

export const createGroup = createAsyncThunk(
  "groups/createGroup",
  async (groupData, { rejectWithValue }) => {
    try {
      const response = await api.post("/groups", groupData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create group"
      );
    }
  }
);

export const inviteMember = createAsyncThunk(
  "groups/inviteMember",
  async ({ groupId, email }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/groups/${groupId}/invite`, { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to invite member"
      );
    }
  }
);

export const removeMember = createAsyncThunk(
  "groups/removeMember",
  async ({ groupId, memberId }, { rejectWithValue }) => {
    try {
      await api.delete(`/groups/${groupId}/members/${memberId}`);
      return { groupId, memberId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to remove member"
      );
    }
  }
);

const initialState = {
  memberOf: [],
  adminOf: [],
  selectedGroup: null,
  groupNotes: [],
  isLoading: false,
  error: null,
};

const groupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedGroup: (state) => {
      state.selectedGroup = null;
      state.groupNotes = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch groups
      .addCase(fetchGroups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.memberOf = action.payload.memberOf || [];
        state.adminOf = action.payload.adminOf || [];
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch group details
      .addCase(fetchGroupDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedGroup = action.payload;
      })
      .addCase(fetchGroupDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch group notes
      .addCase(fetchGroupNotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groupNotes = action.payload;
      })
      .addCase(fetchGroupNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create group
      .addCase(createGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminOf.push(action.payload);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Invite member
      .addCase(inviteMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(inviteMember.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add new member to selected group if available
        if (state.selectedGroup && action.payload.member) {
          state.selectedGroup.Members = [
            ...(state.selectedGroup.Members || []),
            action.payload.member,
          ];
        }
      })
      .addCase(inviteMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Remove member
      .addCase(removeMember.fulfilled, (state, action) => {
        const { memberId } = action.payload;
        if (state.selectedGroup && state.selectedGroup.Members) {
          state.selectedGroup.Members = state.selectedGroup.Members.filter(
            (m) => m.id !== memberId
          );
        }
      });
  },
});

export const { clearError, clearSelectedGroup } = groupsSlice.actions;
export default groupsSlice.reducer;
