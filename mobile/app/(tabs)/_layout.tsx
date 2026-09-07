import { View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, radius } from "@/lib/theme";
import { useAuth } from "@/lib/auth";

export default function TabsLayout() {
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        /* The site's own bar: deep green, a hairline above it, and the
           active tab in terracotta. */
        tabBarActiveTintColor: colors.cinnamon[300],
        tabBarInactiveTintColor: colors.onDark.muted,
        tabBarStyle: {
          backgroundColor: colors.bg.primary,
          borderTopWidth: 1,
          borderTopColor: colors.onDark.line,
          height: 85,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.brandMedium,
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "ראשי",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "חיפוש",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      {/* The site sets this one apart as a round button lifted out of the
          bar, rather than a fifth icon among equals. */}
      <Tabs.Screen
        name="new"
        options={{
          title: "",
          tabBarIcon: () => (
            <View
              style={{
                width: 54,
                height: 54,
                marginTop: -18,
                borderRadius: radius.full,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.green[400],
                borderWidth: 3,
                borderColor: colors.bg.primary,
              }}
            >
              <Ionicons name="add" size={28} color={colors.white} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "שמורים",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark-outline" size={size} color={color} />
          ),
          href: user ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "פרופיל",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
