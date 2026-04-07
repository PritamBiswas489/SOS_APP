import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  contact_list: [],
  refresh: true,
};
const chatContactSlice = createSlice({
  name: 'chatContactList',
  initialState: initialState,
  reducers: {
    setChatContactList(state, action) {
      state.contact_list = action.payload;
    },
    setRefresh(state, action) {
      state.refresh = action.payload;
    },
    resetState(state) {
      return initialState;
    },
  },
});
export const chatContactActions = chatContactSlice.actions;
export default chatContactSlice;