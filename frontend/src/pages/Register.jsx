import { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { FaUser } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { reset, register } from '../features/auth/authSlice'
import Spinner from '../components/Spinner'


function Register() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        password2: ''
    })

    const { firstName, lastName, username, password, password2 } = formData
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
    //FUNCTIONS
    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }))
    }
    const onSubmit = (e) => {
        e.preventDefault()
        if (password != password) {
            toast.error('Passwords do not match')
        } else {
            const userData = {
                firstName, lastName, username, password
            }
            dispatch(register(userData))
        }
    }
    if (isLoading) {
        return <Spinner />
    }
    return (
        <>
            <section className='heading'>
                <h1>
                    <FaUser />Register
                </h1>
                <p>Please Create an Account</p>
            </section>
            <section className='form'>
                <form onSubmit={onSubmit}>
                    <div className='form-group'>
                        <input className='form-control'
                            type='text'
                            id='firstName'
                            name='firstName'
                            value={firstName}
                            placeholder='Enter your First Name'
                            onChange={onChange}
                        />
                    </div>
                    <div className='form-group'>
                        <input className='form-control'
                            type='text'
                            id='lastName'
                            name='lastName'
                            value={lastName}
                            placeholder='Enter your Last Name'
                            onChange={onChange}
                        />
                    </div>
                    <div className='form-group'>
                        <input className='form-control'
                            type='text'
                            id='username'
                            name='username'
                            value={username}
                            placeholder='Enter your username'
                            onChange={onChange}
                        />
                    </div>
                    <div className='form-group'>
                        <input className='form-control'
                            type='password'
                            id='password'
                            name='password'
                            value={password}
                            placeholder='Enter your password'
                            onChange={onChange}
                        />
                    </div>
                    <div className='form-group'>
                        <input className='form-control'
                            type='password2'
                            id='password2'
                            name='password2'
                            value={password2}
                            placeholder='Confirm Password'
                            onChange={onChange}
                        />
                    </div>
                    <div className='form-group'>
                        <button className='btn btn-block' type='submit'>
                            Register
                        </button>
                    </div>
                </form>
            </section>
        </>
    )
}

export default Register