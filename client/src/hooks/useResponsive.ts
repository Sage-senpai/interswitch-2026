import { useWindowDimensions, Platform } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  return {
    isWeb,
    isDesktop,
    isTablet,
    isMobile,
    width,
    height,
    // Content area max-width for centered layout on desktop
    contentMaxWidth: isDesktop ? 860 : isTablet ? 680 : undefined,
    // Sidebar width for desktop navigation
    sidebarWidth: 260,
    // Grid columns for responsive grids
    gridColumns: isDesktop ? 3 : isTablet ? 2 : 1,
  };
}
