import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { darkTheme, lightTheme, ThemeColors } from '../constants/theme';
import { toggleTheme as toggleAction, setTheme as setAction } from '../store/themeSlice';

export function useTheme() {
  const mode = useSelector((state: RootState) => state.theme.mode);
  const dispatch = useDispatch();

  const colors: ThemeColors = mode === 'dark' ? darkTheme : lightTheme;
  const isDark = mode === 'dark';

  return {
    colors,
    isDark,
    mode,
    toggleTheme: () => dispatch(toggleAction()),
    setTheme: (m: 'dark' | 'light') => dispatch(setAction(m)),
  };
}
