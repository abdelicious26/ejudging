import { useState, useEffect } from 'react'
import { FaSignInAlt } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { login, reset } from '../features/auth/authSlice'
import Spinner from '../components/Spinner'

import { Box, Button } from '@mui/material';

function Login() {
    console.log('Login')
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    })

    const { username, password } = formData

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    )
    useEffect(() => {

        if (isError) {
            toast.error(message)
        }
        if (isSuccess || user) {
            navigate('/')
        }
        dispatch(reset())
    }, [user, isError, isSuccess, message, navigate, dispatch])

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }))
    }

    const onSubmit = (e) => {
        e.preventDefault()
        const userData = {
            username,
            password,
        }

        dispatch(login(userData))
    }

    if (isLoading) {
        return <Spinner />
    }

    return (
        <>
            <section className='heading'>
                <p>E-Judging for Tabulation System of </p>
                <p>Saint Francis of Assisi College Alabang</p>
            </section>
            <section className='form'>
                <form onSubmit={onSubmit}>
                    <div className='form-group'>
                        <label>Username</label>
                        <input
                            type='string'
                            className='form-control'
                            id='username'
                            name='username'
                            value={username}
                            placeholder='Enter your username'
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label>Password</label>
                        <input
                            type='password'
                            className='form-control'
                            id='password'
                            name='password'
                            value={password}
                            placeholder='Enter password'
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <Button variant="contained" color="error" type='submit' fullWidth='true'>
                            Submit
                        </Button>
                    </div>
                </form>
            </section>
        </>
    )
}

export default Login