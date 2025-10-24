import { firestoreDb } from "@/config/FirebaseConfig";
import { useAuth, useSSO, useUser } from '@clerk/clerk-expo';
import * as AuthSession from 'expo-auth-session';
import { useRouter } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import { doc, setDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== 'android') return
    void WebBrowser.warmUpAsync()
    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync()
    }
  }, [])
}

WebBrowser.maybeCompleteAuthSession()

export default function Index() {
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(true);

  console.log(user?.primaryEmailAddress?.emailAddress)

  useEffect(() => {
    if(isSignedIn){
      router.replace('/(tabs)/Home')
    }
    if(isSignedIn!=undefined){
      setLoading(false)
    }
  }, [isSignedIn]);

   useWarmUpBrowser()

  // Use the `useSSO()` hook to access the `startSSOFlow()` method
  const { startSSOFlow } = useSSO()

  const onLoginPress = useCallback(async () => {
  try {
    console.log("Redirect URI:", AuthSession.makeRedirectUri({ useProxy: true }));
    const { createdSessionId, setActive, signUp } = await startSSOFlow({
      strategy: 'oauth_google',
      redirectUrl: AuthSession.makeRedirectUri({ useProxy: true }),
    });

    if (signUp?.emailAddress) {
      await setDoc(doc(firestoreDb, 'users', signUp.emailAddress), {
        email: signUp.emailAddress,
        name: `${signUp.firstName ?? ''} ${signUp.lastName ?? ''}`,
        joinedAt: Date.now(),
        credits: 20,
      });
    }

    if (createdSessionId && setActive) {
      await setActive({ session: createdSessionId });
      router.replace('/(tabs)/Home');
    }
  } catch (err) {
    console.error('Lỗi khi đăng nhập Google:', err);
  }
}, []);



  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Welcome to Fruvia</Text>
      {!loading && 
      <TouchableOpacity style={styles.btn}
      onPress={onLoginPress}>
        <Text>Get Started</Text>
      </TouchableOpacity> }
      {loading==undefined && 
      <ActivityIndicator size={"large"}/>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  btn: {
    width: 200,
    height: 50,
    backgroundColor: "#228B22",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginTop: 20,
  }
});
