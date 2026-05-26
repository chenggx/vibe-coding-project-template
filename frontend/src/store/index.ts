import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/modules/auth/slice';
import menuReducer from '@/modules/menu/slice';
import uploadReducer from '@/modules/upload/slice';
import roleReducer from '@/modules/role/slice';
import userReducer from '@/modules/user/slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    menu: menuReducer,
    upload: uploadReducer,
    role: roleReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

if (import.meta.hot) {
  import.meta.hot.accept();
}
