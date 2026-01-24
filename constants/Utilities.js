import { Platform } from "react-native";

export const Utilities = Platform.OS === "android" ? "https://livechatbackendapp.vercel.app/api/auth" : "http://localhost:7070";