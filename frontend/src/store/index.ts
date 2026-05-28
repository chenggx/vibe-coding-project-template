import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '@/app/rootReducer';
import { adminApi } from '@/services/adminApi';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(adminApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

if (import.meta.hot) {
  import.meta.hot.accept();
}
