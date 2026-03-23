import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { useResponsive } from '../../src/hooks/useResponsive';
import DesktopSidebar from '../../src/components/DesktopSidebar';

export default function TabLayout() {
  const { colors } = useTheme();
  const { isDesktop } = useResponsive();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isDesktop && <DesktopSidebar />}
      <View style={styles.content}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textLight,
            tabBarStyle: isDesktop
              ? { display: 'none' }
              : {
                  backgroundColor: colors.tabBar,
                  borderTopColor: colors.tabBarBorder,
                  borderTopWidth: 1,
                  paddingBottom: Platform.OS === 'ios' ? 20 : 6,
                  paddingTop: 6,
                  height: Platform.OS === 'ios' ? 80 : 60,
                },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
            },
            headerStyle: { backgroundColor: colors.headerBg },
            headerTintColor: colors.headerText,
            headerTitleStyle: { fontWeight: '700' },
            headerShadowVisible: false,
            // On desktop, hide individual tab headers (sidebar has branding)
            ...(isDesktop ? { headerShown: false } : {}),
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
              headerTitle: 'Purse',
            }}
          />
          <Tabs.Screen
            name="learn"
            options={{
              title: 'Learn',
              tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
              headerTitle: 'Financial Lessons',
            }}
          />
          <Tabs.Screen
            name="savings"
            options={{
              title: 'Save',
              tabBarIcon: ({ color, size }) => <Ionicons name="wallet" size={size} color={color} />,
              headerTitle: 'Savings Goals',
            }}
          />
          <Tabs.Screen
            name="community"
            options={{
              title: 'WAG',
              tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
              headerTitle: 'Community',
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
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
