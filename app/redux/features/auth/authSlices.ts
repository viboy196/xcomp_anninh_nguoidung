import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {persistReducer} from 'redux-persist';
import ApiRequest from '../../../utils/api/Main/ApiRequest';

export type UsersState = {
  token?: string;
  stateToken?: string;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  errorMessage?: string;
};
const initialState = {
  loading: 'idle',
  token: undefined,
} as UsersState;

export const loginAsync = createAsyncThunk(
  'auth/login',
  // if you type your function argument here
  async (input: {phone: string; password: string}) => {
    return await ApiRequest.LoginApi(input);
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logOut(state) {
      state = {
        ...state,
        token: undefined,
      };
      return state;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginAsync.pending, state => {
        state = {...state, loading: 'pending'};
        return state;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        console.log('loginAsync fulfilled', action.payload);

        if (action.payload.status === true) {
          const rd = uuid.v4() as string;
          state = {
            ...state,
            loading: 'succeeded',
            token: action.payload.result,
            stateToken: rd,
          };
        } else {
          state = {
            ...state,
            loading: 'failed',
            token: undefined,
            errorMessage: action.payload.errorMessage,
          };
        }
        return state;
      });
  },
});
export const {logOut} = authSlice.actions;

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

export default persistReducer(persistConfig, authSlice.reducer);
