import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/stores';


export type AppState = {
  version: string;
};

const initialState: AppState = {
  version: '0.0.1'
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setVersion: (state, action: PayloadAction<string>) => {
      state.version = action.payload
    }
  },
});

export const { setVersion } = appSlice.actions;
export const selectApp = (state: RootState) => state.app;
export default appSlice.reducer;

