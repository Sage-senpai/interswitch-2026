import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'dark' | 'light';

interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = {
  mode: 'dark', // Default to dark (lavender+black)
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem('purse_theme', state.mode).catch(() => {});
    },
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      AsyncStorage.setItem('purse_theme', action.payload).catch(() => {});
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
