import React, { useRef } from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurTargetView } from 'expo-blur';
import { FloatingTabBar } from '@/components/ui/FloatingTabBar';

export default function TabLayout() {
  const blurTargetRef = useRef<View>(null);

  return (
    <BlurTargetView ref={blurTargetRef} style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => (
          <FloatingTabBar
            state={props.state}
            navigation={props.navigation as never}
            blurTargetRef={blurTargetRef}
          />
        )}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          freezeOnBlur: true,
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Today' }} />
        <Tabs.Screen name="logs" options={{ title: 'Logs' }} />
        <Tabs.Screen name="add" options={{ title: 'Add' }} />
        <Tabs.Screen name="quickmeals" options={{ title: 'Quick' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
    </BlurTargetView>
  );
}
