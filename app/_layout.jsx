import React from "react";
import { Provider } from "react-redux";
import { Stack } from "expo-router";
import Mystore from "../redux/store/Mystore";

export default function RootLayout() {
    return (
        <Provider store={Mystore}>
            <Stack screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
                animationDuration: 600,
            }} />
        </Provider>
    );
}
