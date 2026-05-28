import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/modules/auth/slice';
import themeReducer from '@/modules/theme/slice';
import { adminApi } from '@/services/adminApi';

const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  [adminApi.reducerPath]: adminApi.reducer,
});

export default rootReducer;
