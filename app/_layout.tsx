import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot } from "expo-router";
import React from "react";
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout() {
  return (
    <SafeAreaView style={styles.container} >
      <ClerkProvider 
        publishableKey={CLERK_PUBLISHABLE_KEY ?? ''}
        tokenCache={tokenCache}
      >
        <Slot />
      </ClerkProvider>
    </SafeAreaView>
    
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
})