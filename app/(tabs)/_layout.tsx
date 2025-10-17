import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

export default function Tablayout() {
  return (
    <Tabs>
      <Tabs.Screen name="Home" options={{ headerShown: false, title: 'Home' }} />
      <Tabs.Screen name="Calendar" options={{ headerShown: false, title: 'Search' }} />
      <Tabs.Screen name="Project" options={{ headerShown: false, title: 'Cart' }} />
      <Tabs.Screen name="Profile" options={{ headerShown: false, title: 'Profile' }} />
    </Tabs>
  )
}