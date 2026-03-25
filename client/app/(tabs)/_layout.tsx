import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { useResponsive } from '../../src/hooks/useResponsive';
import DesktopSidebar from '../../src/components/DesktopSidebar';

// Icon names: [active, inactive]
const TAB_ICONS: Record<string, [string, string]> = {
  index:     ['home',   'home-outline'],
  learn:     ['book',   'book-outline'],
  savings:   ['wallet', 'wallet-outline'],
  community: ['people', 'people-outline'],
  profile:   ['person', 'person-outline'],
};

interface TabIconProps {
  name: string;
  color: string;
  size: number;
  focused: boolean;
}

function TabIcon({ name, color, size, focused }: TabIconProps) {
  const [active, inactive] = TAB_ICONS[name] ?? ['ellipse', 'ellipse-outline'];
  const iconName = focused ? active : inactive;
  return <Ionicons name={iconName as any} size={size} color={color} />;
}

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const { isDesktop } = useResponsive();

  const floatingTabBarStyle = {
    position: 'absolute' as const,
    bottom: 16,
    left: 20,
    right: 20,
    borderRadius: 28,
    height: 64,
    backgroundColor: isDark ? 'rgba(17,17,24,0.92)' : 'rgba(255,255,255,0.92)',
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    ...(Platform.OS === 'web'
      ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }
      : {}),
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isDesktop && <DesktopSidebar />}
      <View style={styles.content}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textLight,
            tabBarStyle: isDesktop ? { display: 'none' } : floatingTabBarStyle,
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
              // Push label down slightly so it sits nicely inside the pill
              marginBottom: 6,
            },
            // Keep items centered vertically within the taller pill
            tabBarItemStyle: {
              paddingTop: 8,
            },
            headerStyle: { backgroundColor: colors.headerBg },
            headerTintColor: colors.headerText,
            headerTitleStyle: { fontWeight: '700' },
            headerShadowVisible: false,
            ...(isDesktop ? { headerShown: false } : {}),
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size, focused }) => (
                <TabIcon name="index" color={color} size={size} focused={focused} />
              ),
              headerTitle: 'Purse',
            }}
          />
          <Tabs.Screen
            name="learn"
            options={{
              title: 'Learn',
              tabBarIcon: ({ color, size, focused }) => (
                <TabIcon name="learn" color={color} size={size} focused={focused} />
              ),
              headerTitle: 'Financial Lessons',
            }}
          />
          <Tabs.Screen
            name="savings"
            options={{
              title: 'Save',
              tabBarIcon: ({ color, size, focused }) => (
                <TabIcon name="savings" color={color} size={size} focused={focused} />
              ),
              headerTitle: 'Savings Goals',
            }}
          />
          <Tabs.Screen
            name="community"
            options={{
              title: 'WAG',
              tabBarIcon: ({ color, size, focused }) => (
                <TabIcon name="community" color={color} size={size} focused={focused} />
              ),
              headerTitle: 'Community',
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, size, focused }) => (
                <TabIcon name="profile" color={color} size={size} focused={focused} />
              ),
              headerTitle: 'My Profile',
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
});
