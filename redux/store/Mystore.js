import { configureStore } from "@reduxjs/toolkit";
import AuthSlice from "../slices/AuthSlce.js";

const Mystore = configureStore({
    reducer: {
        authslice: AuthSlice,
    },
});

export default Mystore;
