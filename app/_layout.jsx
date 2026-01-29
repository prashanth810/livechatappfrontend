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
        }} >
            {/* 👇 REGISTER MODAL PROPERLY */}
            <Stack.Screen
                name="/(profile)/ProfileModel"
                options={{ presentation: "modal" }}
            />

            {/* <Stack.Screen
                name="/(main)/NewconversationModel"
                options={{ presentation: "modal" }}
            /> */}

            {/* Modal screens */}
            <Stack.Screen
                name="(modal)"
                options={{
                    presentation: "modal",
                    animation: "slide_from_bottom",
                }}
            />

        </Stack>
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