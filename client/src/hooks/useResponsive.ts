import { useWindowDimensions, Platform } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  // Sidebar is 260px; fill remaining space generously
  const availableWidth = isDesktop ? width - 260 : width;

  return {
    isWeb,
    isDesktop,
    isTablet,
    isMobile,
    width,
    height,
    // Content fills most of the remaining space (90% up to 1200px)
    contentMaxWidth: isDesktop
      ? Math.min(availableWidth * 0.92, 1200)
      : isTablet
        ? Math.min(width * 0.9, 780)
        : undefined,
    // Sidebar width for desktop navigation
    sidebarWidth: 260,
    // Grid columns for responsive grids
    gridColumns: isDesktop ? 3 : isTablet ? 2 : 1,
    // Desktop-aware border radius (bigger screens → softer corners)
    cardRadius: isDesktop ? 20 : 16,
    cardRadiusLg: isDesktop ? 28 : 20,
  };
}
