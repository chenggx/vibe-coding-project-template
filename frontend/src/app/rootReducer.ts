import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/modules/auth/slice';
import menuReducer from '@/modules/menu/slice';
import uploadReducer from '@/modules/upload/slice';
import roleReducer from '@/modules/role/slice';
import userReducer from '@/modules/user/slice';

const rootReducer = combineReducers({
  auth: authReducer,
  menu: menuReducer,
  upload: uploadReducer,
  role: roleReducer,
  user: userReducer,
});

export default rootReducer;
