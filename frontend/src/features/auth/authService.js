import axios from 'axios'
const envVariables = process.env;
const {
    REACT_APP_BACKEND_API
} = envVariables;
// const API_URL = 'http://localhost:5000/api/users/' 

const API_URL = REACT_APP_BACKEND_API + 'users/';
// Register user
const register = async (userData) => {
    const response = await axios.post(API_URL, userData)

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data))
    }

    return response.data
}

// Login user
const login = async (userData) => {
    console.log(API_URL + 'login');
    const response = await axios.post(API_URL + 'login', userData)

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data))
    }

    return response.data
}

// Logout user
const logout = () => {
    localStorage.removeItem('user')
}

const authService = {
    register,
    logout,
    login
}

export default authService