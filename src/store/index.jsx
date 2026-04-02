import { configureStore } from '@reduxjs/toolkit';
import userSlice from './redux/user.redux';

const store = configureStore({
  reducer: {
    userProviderData: userSlice.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Increase the timeout threshold for warnings
        warnAfter: 128, // Increase threshold to 128ms
      },
    }),
});

export default store;
