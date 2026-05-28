import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/modules/auth/slice';
import roleReducer from '@/modules/role/slice';
import userReducer from '@/modules/user/slice';
import themeReducer from '@/modules/theme/slice';
import { adminApi } from '@/services/adminApi';

const rootReducer = combineReducers({
  auth: authReducer,
  role: roleReducer,
  user: userReducer,
  theme: themeReducer,
  [adminApi.reducerPath]: adminApi.reducer,
});

export default rootReducer;
