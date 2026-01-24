import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginApi, registerApi } from "../services/AuthService";

export const handleregister = createAsyncThunk("auth/register", async (data, thunkAPI) => {
    try {
        const response = await registerApi(data);
        console.log(response, 'resssssssssss from auth slice ')
        return response.data;
    }
    catch (error) {
        return thunkAPI.rejectWithValue(
            error.response?.data?.message || error.message
        );
    }
});


export const handlelogin = createAsyncThunk("auth/login", async (data, thunkAPI) => {
    try {
        const response = await loginApi(data);
        console.log(response, 'resssssssssss from loginnnnnnnn ')
        return response.data;
    }
    catch (error) {
        return thunkAPI.rejectWithValue(
            error.response?.data?.message || error.message
        );
    }
});


const initialState = {
    regisetdata: {
        registeruser: {},
        registerloading: false,
        registererror: null,
        token: null,
    },
    logindata: {
        loginuser: {},
        loginloading: false,
        loginerror: null,
        token: null,
    }
}

const AuthSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // regisetr apis 
            .addCase(handleregister.pending, (state) => {
                state.regisetdata.registerloading = true;
                state.regisetdata.registererror = null;
            })
            .addCase(handleregister.fulfilled, (state, action) => {
                state.regisetdata.registerloading = false;
                state.regisetdata.registeruser = action.payload;
                state.regisetdata.token = action.payload.token;
            })
            .addCase(handleregister.rejected, (state, action) => {
                state.regisetdata.registerloading = false;
                state.regisetdata.registererror = action.payload;
            })

            // login apis 
            .addCase(handlelogin.pending, (state) => {
                state.logindata.loginloading = true;
                state.logindata.loginerror = null;
            })
            .addCase(handlelogin.fulfilled, (state, action) => {
                state.logindata.loginloading = false;
                state.logindata.loginuser = action.payload;
                state.logindata.token = action.payload.token;
            })
            .addCase(handlelogin.rejected, (state, action) => {
                state.logindata.loginloading = false;
                state.logindata.loginerror = action.payload;
            })
    }
})

export default AuthSlice.reducer;