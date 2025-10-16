import { Stack } from "expo-router"; 
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { ClerkProvider, useAuth } from '@clerk/clerk-expo'

export default function RootLayout() {


  return (
    <ClerkProvider tokenCache={tokenCache}>
    <Stack screenOptions={{
          headerShown: false
          }}> 
      <Stack.Screen name="index"/>
    </Stack>
    </ClerkProvider>
  );
}