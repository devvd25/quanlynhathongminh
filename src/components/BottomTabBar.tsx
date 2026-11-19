/**
 * Component: BottomTabBar
 * Thanh điều hướng dưới cùng phong cách Modern Smart Home (như ảnh mẫu)
 * Hỗ trợ 3 Tab: Thiết bị (Dashboard), Thống kê (Analytics), Cài đặt (Settings)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeColors, Radii, Spacing } from '../constants/theme';

export type TabKey = 'dashboard' | 'analytics' | 'settings';

interface BottomTabBarProps {
  currentTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  theme: ThemeColors;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ currentTab, onTabChange, theme }) => {
  const tabs: { key: TabKey; label: string; icon: string; iconFamily: 'ion' | 'material' }[] = [
    { key: 'dashboard', label: 'Thiết bị', icon: 'home-outline', iconFamily: 'ion' },
    { key: 'analytics', label: 'Thống kê', icon: 'chart-line', iconFamily: 'material' },
    { key: 'settings', label: 'Cài đặt', icon: 'tune-vertical', iconFamily: 'material' },
  ];

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          shadowColor: theme.shadowColor,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = currentTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              {tab.iconFamily === 'ion' ? (
                <Ionicons
                  name={(isActive ? tab.icon.replace('-outline', '') : tab.icon) as any}
                  size={22}
                  color={isActive ? theme.primary : theme.textMuted}
                />
              ) : (
                <MaterialCommunityIcons
                  name={tab.icon as any}
                  size={22}
                  color={isActive ? theme.primary : theme.textMuted}
                />
              )}
              {isActive && (
                <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />
              )}
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive ? theme.primary : theme.textMuted,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: 64,
    borderTopWidth: 1,
    paddingHorizontal: Spacing.base,
    paddingVertical: 6,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 26,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
  },
});
