import { Platform } from "react-native";

export const Utilities = Platform.OS === "android" ? "https://chatappbackend-umber.vercel.app/api/auth" : "http://localhost:7070";