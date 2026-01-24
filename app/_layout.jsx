import React from "react";
import { Provider } from "react-redux";
import { Stack } from "expo-router";
import Mystore from "../redux/store/Mystore";

const StackLayout = () => {
    return (
        <Stack screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            animationDuration: 600,
        }} />
    );
}

const RootLayout = () => {
    return (
        <Provider store={Mystore}>
            <StackLayout />
        </Provider>
    )
}


export default RootLayout;