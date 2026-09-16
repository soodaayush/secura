import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { MapScreen } from '../screens/MapScreen';
import { SafeRouteScreen } from '../screens/SafeRouteScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { AdminScreen } from '../screens/AdminScreen';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bgElevated,
    border: colors.border,
    primary: colors.accent,
    text: colors.textPrimary,
  },
};

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Map: 'map-outline',
  'Safe Route': 'navigate-outline',
  Community: 'people-outline',
  Admin: 'shield-outline',
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.bgElevated,
            borderTopColor: colors.border,
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={ICONS[route.name]} size={size} color={color} />
          ),
        })}
      >
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Safe Route" component={SafeRouteScreen} />
        <Tab.Screen name="Community" component={CommunityScreen} />
        <Tab.Screen name="Admin" component={AdminScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
