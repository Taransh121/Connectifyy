// import { createSlice } from '@reduxjs/toolkit';

// // Initial state for the user
// const initialState = {
//     isLoggedIn: false,
//     userInfo: null,
// };

// // Create a slice for user state
// const userSlice = createSlice({
//     name: 'user',
//     initialState,
//     reducers: {
//         login: (state, action) => {
//             state.isLoggedIn = true;
//             state.userInfo = action.payload;
//         },
//         logout: (state) => {
//             state.isLoggedIn = false;
//             state.userInfo = null;
//         },
//     },
// });

// // Export the actions
// export const { login, logout } = userSlice.actions;

// // Export the reducer
// export default userSlice.reducer;


import { createSlice } from '@reduxjs/toolkit';

// Initial state for the user
const initialState = {
    isLoggedIn: false,
    userInfo: null,
};

// Create a slice for user state
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state, action) => {
            state.isLoggedIn = true;
            state.userInfo = action.payload;
        },
        logout: (state) => {
            state.isLoggedIn = false;
            state.userInfo = null;
        },
        setUser: (state, action) => {
            // For cases where you want to directly set the user info
            state.userInfo = action.payload;
        }
    },
});

// Export the actions
export const { login, logout, setUser } = userSlice.actions;

// Export the reducer
export default userSlice.reducer;
