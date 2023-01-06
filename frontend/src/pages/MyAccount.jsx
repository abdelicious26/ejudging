import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

import { toast } from 'react-toastify';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Divider from '@mui/material/Divider';

function MyAccount() {
    const { user } = useSelector((state) => state.auth);
    const token = user.token;
    const [changePassword, setChangePassword] = useState(false);
    const [updateUser, setUpdateUser] = useState({
        _id: '',
        firstName: '',
        lastName: '',
        username: '',
        recordType: ''
    });

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '90%',
        maxHeight: '90%',
        bgcolor: 'background.paper',
        border: '2px solid #000',
        overflow: 'auto',
        boxShadow: 24,
        pt: 2,
        px: 4,
        pb: 3,
    };

    const modalStyle = {
        position: 'absolute',
        top: '10%',
        left: '10%',
        overflow: 'auto',
        height: '100%',
        display: 'block'
    };

    //VARIABLES
    const { _id, firstName, lastName, username, recordType } = updateUser


    //USE EFFECTS
    useEffect(() => {
        axios.get(
            'http://localhost:5000/api/users/me',
            { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                if (!response) setUpdateUser("No User Record")
                setUpdateUser(response.data);
                console.log(response.data)
            })
    }, [])


    //ONCHANGE FUNCTIONS
    const onChangeUpdate = (e) => {
        setUpdateUser((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }))
    }

    //ON SUBMIT FUNCTIONS
    const updateDetails = (e) => {
        e.preventDefault();
        let URL = 'http://localhost:5000/api/users/update/' + _id;
        if (!_id) {
            return toast.error('Please select a user record');
        }
        console.log(URL)
        console.log('firstname ' + firstName)
        //SAVE UPDATE USER
        axios.put(
            URL,
            {
                firstName: firstName,
                lastName: lastName,
                username: username,
                recordType: recordType,
                isActive: true
            },
            { headers: { "Authorization": `Bearer ${token}` } })
            .then((response) => {
                console.log('success')
                toast.success('Update Success');
                setUpdateUser({
                    firstName: response.firstName,
                    lastName: response.lastName
                })
                console.log('updateUser => ', updateUser);
            })
            .catch((error) => {
                toast.error('Sorry, there was an error. the username might be already existing.')
            })
    }

    const submitChangePassword = (e) => {
        e.preventDefault();
        if (window.confirm('Are you sure you want to change password?')) {
            setChangePassword(false);
        }
    }

    return (
        <>
            <div>
                <section className='heading'>
                    <h1>
                        <p>My Account</p>
                    </h1>
                </section>
                <div>
                    <section className='form'>
                        <form onSubmit={updateDetails}>
                            <div className='form-group'>
                                <label>First Name</label>
                                <input
                                    type='text'
                                    className='form-control'
                                    id='firstName'
                                    name='firstName'
                                    value={updateUser.firstName}
                                    onChange={onChangeUpdate}
                                    required
                                />
                            </div>
                            <div className='form-group'>
                                <label>Last Name</label>
                                <input
                                    type='text'
                                    className='form-control'
                                    id='lastName'
                                    name='lastName'
                                    value={updateUser.lastName}
                                    onChange={onChangeUpdate}
                                    required
                                />
                            </div>
                            <div className='form-group'>
                                <label>Username</label>
                                <input
                                    type='text'
                                    className='form-control'
                                    id='username'
                                    name='username'
                                    value={updateUser.username}
                                    onChange={onChangeUpdate}
                                    required
                                    disabled
                                />
                            </div>
                            <div className='form-group'>
                                <label>User Type</label>
                                <input
                                    type='text'
                                    className='form-control'
                                    id='recordType'
                                    name='recordType'
                                    value={updateUser.recordType}
                                    required
                                    disabled
                                />
                            </div>
                            <div className='form-group'>
                                <Button variant="contained" color="success" type='submit' fullWidth='true'>
                                    Update
                                </Button>
                            </div>

                        </form>

                        <Divider />

                        <div className='form-group'>
                            <Box sx={{ mt: 1 }}>
                                <Button variant="outlined" color="error" fullWidth='true' onClick={() => setChangePassword(true)}>
                                    Change Password
                                </Button>
                            </Box>
                        </div>
                    </section>
                </div>
            </div>

            {/* RESET PASSWORD MODAL */}

            <Modal
                open={changePassword}
                onClose={() => setChangePassword(false)}
                aria-labelledby="parent-modal-title"
                aria-describedby="parent-modal-description"
            // style={modalStyle}
            >
                <Box sx={{ ...style }}>
                    <section>
                        <form onSubmit={submitChangePassword}>
                            <div>
                                <section className='heading'>
                                    <h1>
                                        <p>Reset Password</p>
                                    </h1>
                                </section>
                            </div>

                            <div className='form-group'>
                                <div className='form-group'>
                                    <label>Old Password</label>
                                    <input
                                        type='password'
                                        className='form-control'
                                        id='oldPassword'
                                        name='oldPassword'
                                        // value={updateUser.username}
                                        onChange={onChangeUpdate}
                                        required
                                    />
                                </div>
                                <div className='form-group'>
                                    <label>New Password</label>
                                    <input
                                        type='password'
                                        className='form-control'
                                        id='newPassword'
                                        name='newPassword'
                                        // value={updateUser.recordType}
                                        required
                                    />
                                </div>
                                <div className='form-group'>
                                    <label>Confirm Password</label>
                                    <input
                                        type='password'
                                        className='form-control'
                                        id='confirmPassword'
                                        name='confirmPassword'
                                        // value={updateUser.recordType}
                                        required
                                    />
                                </div>
                            </div>
                            <div className='form-group'>
                                <Button variant="contained" color="success" type='Submit' fullWidth>
                                    Confirm
                                </Button>
                            </div>
                            <div className='form-group'>
                                <Button variant="outlined" color="error" onClick={() => setChangePassword(false)} fullWidth>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </section>
                </Box>
            </Modal>
        </>
    )
}

export default MyAccount;