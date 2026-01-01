import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { uploadFile } from "../../api/axios";

// Async thunks
export const fetchNotes = createAsyncThunk(
  "notes/fetchNotes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/notes");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch notes"
      );
    }
  }
);

export const fetchPublicNotes = createAsyncThunk(
  "notes/fetchPublicNotes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/notes/public");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch public notes"
      );
    }
  }
);

/**
 * Create a new note with optional file attachment
 * @param {Object} noteData - Note data object
 * @param {File} [noteData.attachment] - Optional file attachment
 */
export const createNote = createAsyncThunk(
  "notes/createNote",
  async (noteData, { rejectWithValue }) => {
    try {
      const { attachment, ...data } = noteData;

      if (attachment) {
        // Use FormData for file uploads
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("content", data.content || "");
        formData.append("course_id", data.course_id || "");
        formData.append("tags", JSON.stringify(data.tags || []));
        formData.append("is_public", data.is_public || false);
        formData.append("group_id", data.group_id || "");
        formData.append("attachment", attachment);

        const response = await uploadFile("/notes", formData, "post");
        return response.data;
      } else {
        const response = await api.post("/notes", data);
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create note"
      );
    }
  }
);

/**
 * Update an existing note with optional file attachment
 * @param {Object} param0 - Object containing id and note data
 */
export const updateNote = createAsyncThunk(
  "notes/updateNote",
  async ({ id, attachment, ...noteData }, { rejectWithValue }) => {
    try {
      if (attachment) {
        // Use FormData for file uploads
        const formData = new FormData();
        formData.append("title", noteData.title);
        formData.append("content", noteData.content || "");
        formData.append("tags", JSON.stringify(noteData.tags || []));
        formData.append("is_public", noteData.is_public || false);
        formData.append("group_id", noteData.group_id || "");
        formData.append("attachment", attachment);

        const response = await uploadFile(`/notes/${id}`, formData, "put");
        return response.data;
      } else {
        const response = await api.put(`/notes/${id}`, noteData);
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update note"
      );
    }
  }
);

export const deleteNote = createAsyncThunk(
  "notes/deleteNote",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/notes/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete note"
      );
    }
  }
);

export const deleteAttachment = createAsyncThunk(
  "notes/deleteAttachment",
  async ({ noteId, attachmentId }, { rejectWithValue }) => {
    try {
      await api.delete(`/notes/${noteId}/attachments/${attachmentId}`);
      return { noteId, attachmentId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete attachment"
      );
    }
  }
);

const initialState = {
  items: [],
  publicItems: [],
  selectedNote: null,
  isLoading: false,
  error: null,
  filters: {
    courseId: null,
    searchQuery: "",
    tags: [],
    sortBy: "dateDesc", // dateDesc, dateAsc, titleAsc, titleDesc
  },
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    selectNote: (state, action) => {
      state.selectedNote = action.payload;
    },
    clearSelectedNote: (state) => {
      state.selectedNote = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notes
      .addCase(fetchNotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch public notes
      .addCase(fetchPublicNotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.publicItems = action.payload;
      })
      .addCase(fetchPublicNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create note
      .addCase(createNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update note
      .addCase(updateNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(
          (note) => note.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedNote?.id === action.payload.id) {
          state.selectedNote = action.payload;
        }
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete note
      .addCase(deleteNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter((note) => note.id !== action.payload);
        if (state.selectedNote?.id === action.payload) {
          state.selectedNote = null;
        }
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete attachment
      .addCase(deleteAttachment.fulfilled, (state, action) => {
        const { noteId, attachmentId } = action.payload;
        const note = state.items.find((n) => n.id === noteId);
        if (note && note.Attachments) {
          note.Attachments = note.Attachments.filter(
            (a) => a.id !== attachmentId
          );
        }
        if (
          state.selectedNote?.id === noteId &&
          state.selectedNote.Attachments
        ) {
          state.selectedNote.Attachments =
            state.selectedNote.Attachments.filter((a) => a.id !== attachmentId);
        }
      });
  },
});

export const {
  selectNote,
  clearSelectedNote,
  setFilters,
  clearFilters,
  clearError,
} = notesSlice.actions;
export default notesSlice.reducer;
