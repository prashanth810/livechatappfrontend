import { Platform } from "react-native";

export const Utilities = Platform.OS === "android" ? "https://chatappbackend-pi.vercel.app/api/auth" : "http://localhost:7070";

export const CLOUDINARY_NAME = "dxklva8qk";
export const CLOUDINARY_UPLOAD_PRESET = "images";