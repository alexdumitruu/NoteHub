import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import notesReducer from "../features/notes/notesSlice";
import coursesReducer from "../features/courses/coursesSlice";
import groupsReducer from "../features/groups/groupsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notes: notesReducer,
    courses: coursesReducer,
    groups: groupsReducer,
  },
});

export default store;
