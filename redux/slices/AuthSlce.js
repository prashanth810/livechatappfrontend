import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getprofiledata, loginApi, registerApi } from "../services/AuthService";

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


export const fetchselfprofile = createAsyncThunk("/auth/profile", async (_, thunkAPI) => {
    try {
        const response = await getprofiledata();
        return response.data.data;
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error.message);
    }
})


const initialState = {
    token: null,   // ⭐ GLOBAL TOKEN
    user: null,
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
    },
    profiledata: {
        profileuser: {},
        profileloading: false,
        profileerror: null,
    },
}

const AuthSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.profiledata.profileuser = {};
        },
    },

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

                // logout purpose 
                state.token = action.payload.token;   // ⭐ HERE
                state.user = action.payload.user;
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
                // logou purpose
                state.token = action.payload.token;   // ⭐ HERE
                state.user = action.payload.user;

            })
            .addCase(handlelogin.rejected, (state, action) => {
                state.logindata.loginloading = false;
                state.logindata.loginerror = action.payload;
            })

            .addCase(fetchselfprofile.pending, (state) => {
                state.profiledata.profileloading = true;
                state.profiledata.profileerror = null;
            })
            .addCase(fetchselfprofile.fulfilled, (state, action) => {
                state.profiledata.profileloading = false;
                state.profiledata.profileuser = action.payload;
            })
            .addCase(fetchselfprofile.rejected, (state, action) => {
                state.profiledata.profileloading = false;
                state.profiledata.profileerror = action.payload;
            })

    }
})

export const { logout } = AuthSlice.actions;
export default AuthSlice.reducer;