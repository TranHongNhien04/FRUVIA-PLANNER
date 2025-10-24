import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot } from "expo-router";
import React from "react";

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout() {
  return (
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY ?? ''}
      tokenCache={tokenCache}
    >
      <Slot />
    </ClerkProvider>
  );
}