import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#228B22',
      tabBarInactiveTintColor: '#666',
      tabBarStyle: {
        paddingBottom: 5,
        paddingTop: 5,
        height: 60
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500'
      }
    }}>
      <Tabs.Screen 
        name="Home" 
        options={{
          headerShown: false,
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen 
        name="Calendar" 
        options={{
          headerShown: false,
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen 
        name="Project" 
        options={{
          headerShown: false,
          title: 'Projects',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-outline" size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen 
        name="Profile" 
        options={{
          headerShown: false,
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          )
        }}
      />
    </Tabs>
  )
}
