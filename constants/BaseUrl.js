import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Utilities } from "./Utilities";

const BaseUrl = axios.create({
    baseURL: Utilities,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Token interceptor
BaseUrl.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("token");
        console.log(token, 'tttttttttttttt');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default BaseUrl;
