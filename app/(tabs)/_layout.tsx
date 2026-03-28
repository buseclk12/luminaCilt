import { Tabs } from "expo-router";
import { View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

function TabIcon({
  name,
  focused,
  size,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  size: number;
}) {
  if (focused) {
    return (
      <View
        className="w-12 h-12 rounded-full bg-charcoal items-center justify-center"
        style={{ marginTop: -20 }}
      >
        <Ionicons name={name} size={22} color="#FFFFFF" />
      </View>
    );
  }
  return <Ionicons name={name} size={size} color="#AAAAAA" />;
}

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          height: Platform.OS === "ios" ? 88 : 70,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#2D2D2D",
        tabBarInactiveTintColor: "#AAAAAA",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ focused, size }) => (
            <TabIcon name="home-outline" focused={focused} size={size} />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          title: t("tabs.routine"),
          tabBarIcon: ({ focused, size }) => (
            <TabIcon name="checkmark-circle-outline" focused={focused} size={size} />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: t("tabs.products"),
          tabBarIcon: ({ focused, size }) => (
            <TabIcon name="flask-outline" focused={focused} size={size} />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ focused, size }) => (
            <TabIcon name="person-outline" focused={focused} size={size} />
          ),
          tabBarLabel: () => null,
        }}
      />
    </Tabs>
  );
}
