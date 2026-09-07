import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { I18nManager } from "react-native";
import { useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

/* Hold the splash until the typefaces are in. Letting the app draw first
   means every screen renders in the system font and then jumps. */
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const loadUser = useAuth((s) => s.loadUser);

  const [fontsReady, fontError] = useFonts({
    RecipeBaba: require("../assets/fonts/baba-v2-fm-bold.otf"),
    RecipeUnica: require("../assets/fonts/fb-unica-sans-hebrew-regular.otf"),
    RecipeUnicaMedium: require("../assets/fonts/fb-unica-sans-hebrew-medium.otf"),
  });

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    /* A font that fails to load is not worth a blank screen — the system
       face is a poor substitute, but it is readable. */
    if (fontsReady || fontError) SplashScreen.hideAsync().catch(() => {});
  }, [fontsReady, fontError]);

  if (!fontsReady && !fontError) return null;

  return (
    <>
      {/* The ground is near-black green, so the clock and battery go light. */}
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg.primary },
          animation: "slide_from_left",
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" options={{ presentation: "modal" }} />
        <Stack.Screen name="register" options={{ presentation: "modal" }} />
        <Stack.Screen name="recipe/[id]" />
        <Stack.Screen name="recipe/new" />
        <Stack.Screen name="profile/[username]" />
      </Stack>
    </>
  );
}
