import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Spinner from '../components/Spinner'
import axios from 'axios'
import { toast } from 'react-toastify'
import Modal from 'react-modal'
import Select from 'react-select';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));


Modal.setAppElement('#root')
function MaintenanceUser() {
    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
        },
    };
    
    const RecordType = [
        { label: "Admin", value: 'admin' },
        { label: "Judge", value: 'judge' }
    ];
    const [allUsers, setAllUsers] = useState([]);
    const [newUser, setNewUser] = useState({
        newFirstName: '',
        newLastName: '',
        newUsername: '',
        newRecordType: ''
    });
    const [updateUser, setUpdateUser] = useState({
        updateId: '',
        updateFirstName: '',
        updateLastName: '',
        updateUsername: '',
        updateRecordType: '',
        updateIsActive: true
    });

    //VARIABLES
    const [modal, setModal] = useState(false);
    const [resetModal, setResetModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const { newFirstName, newLastName, newUsername, newRecordType } = newUser
    const { updateId, updateFirstName, updateLastName, updateUsername, updateRecordType, updateIsActive } = updateUser

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const token = user.token
    let selectedUser = {};
    if (!user) {
        navigate('/login')
    }
    if (user && user.recordType !== 'admin') {
        navigate('/judge')
    }
    useEffect(() => {
        axios.get(
            'http://localhost:5000/api/users/',
            { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                if (!response) setAllUsers("No User Records")
                setAllUsers(response.data);
                console.log(response.data)
            })
    }, [])

    //console.log(allUsers);


    //@UPDATE User RECORD -------------------------------------------
    const openRecord = (event) => {
        //console.log(event.target.id)
        selectedUser = event.target.id;
        let result = allUsers.find(({ _id }) => _id === selectedUser);
        setViewModal(true);
        console.log(result.description)
        setUpdateUser({
            updateId: result._id,
            updateFirstName: result.firstName,
            updateLastName: result.lastName,
            updateUsername: result.username,
            updateRecordType: result.recordType,
            updateIsActive: result.isActive
        })
        console.log(updateUser)
    }

    //ONCHANGE FUNCTIONS
    const onChangeNew = (e) => {
        setNewUser((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }))
    }
    const onChangeUpdate = (e) => {
        setUpdateUser((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }))
    }
    const onChangeCheckbox = (e) => {
        setUpdateUser((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.checked,
        }))
        console.log(e.target.checked)
    }
    const onChangeDropdownNew = (e) => {
        setNewUser((prevState) => ({
            ...prevState,
            newRecordType: e.value,
        }))
        console.log(newUser)
    }
    const onChangeDropdownUpdate = (e) => {
        setUpdateUser((prevState) => ({
            ...prevState,
            updateRecordType: e.value,
        }))
        console.log(updateUser)
    }

    //ONCLICK FUNCTIONS
    //CREATE NEW USER BUTTON
    const onSubmitCreate = (e) => {
        e.preventDefault()
        let URL = 'http://localhost:5000/api/users/create'
        console.log(URL)
        if (!newRecordType) {
            return toast.error('Please Select a Record Type');
        }
        //SAVE NEW USER
        axios.post(
            URL,
            {
                firstName: newFirstName,
                lastName: newLastName,
                username: newUsername,
                recordType: newRecordType
            },
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            .then((response) => {
                console.log('success', response);
                toast.success('Save Success');
                setNewUser({
                    newFirstName: '',
                    newLastName: '',
                    newUsername: '',
                    newRecordType: ''
                })
                // AUTO REFRESH TABLE
                axios.get(
                    'http://localhost:5000/api/users/',
                    { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                        if (!response) setAllUsers("No User Records")
                        setAllUsers(response.data);
                        console.log(response.data)
                    })
            })
            .catch((error) => {
                console.log(error)
                toast.error('Sorry, there was an error. the username might be already existing.')
            })
    }
    // UPDATE USER BUTTON
    const onSubmitUpdate = (e) => {
        e.preventDefault()
        let URL = 'http://localhost:5000/api/users/update/' + updateId
        if (!updateId) {
            return toast.error('Please select a user record');
        }
        if (!updateRecordType) {
            return toast.error('Please Select a Record Type');
        }
        console.log(URL)
        console.log('firstname ' + updateFirstName)
        console.log('lastname ' + updateLastName)
        console.log('username ' + updateUsername)
        console.log('recordtpye ' + updateRecordType)
        console.log('isactive ' + updateIsActive)
        //SAVE UPDATE USER
        axios.put(
            URL,
            {
                firstName: updateFirstName,
                lastName: updateLastName,
                username: updateUsername,
                recordType: updateRecordType,
                isActive: updateIsActive
            },
            { headers: { "Authorization": `Bearer ${token}` } })
            .then((response) => {
                console.log('success')
                toast.success('Update Success');
                setUpdateUser({
                    updateId: '',
                    updateFirstName: '',
                    updateLastName: '',
                    updateUsername: '',
                    updateRecordType: '',
                    updateIsActive: false
                })
                console.log(updateUser);
                setViewModal(false);
                // AUTO REFRESH TABLE
                axios.get(
                    'http://localhost:5000/api/users/',
                    { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                        if (!response) setAllUsers("No User Records")
                        setAllUsers(response.data);
                        console.log(response.data)
                    })
            })
            .catch((error) => {
                toast.error('Sorry, there was an error. the username might be already existing.')
            })
    }


    return (
        <>
            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Item>
                            <section className='heading'>
                                <h1>
                                    List of Users
                                </h1>
                                {/* <button onClick={() => setModal(true)} className='btn'>
                                    Add New
                                </button> */}
                                <Grid container justify="flex-end">
                                    <Button variant="contained" color="success" size="large" onClick={() => setModal(true)}>
                                        Add New
                                    </Button>
                                </Grid>
                            </section>

                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="right">First Name</TableCell>
                                            <TableCell align="right">Last Name</TableCell>
                                            <TableCell align="right">Username</TableCell>
                                            <TableCell align="right">User Type</TableCell>
                                            <TableCell align="right">Active?</TableCell>
                                            <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {allUsers.map((row) => (
                                            <TableRow
                                                key={row._id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell align="right">{row.firstName}</TableCell>
                                                <TableCell align="right">{row.lastName}</TableCell>
                                                <TableCell align="right">{row.username}</TableCell>
                                                <TableCell align="right">{row.recordType}</TableCell>
                                                <TableCell align="right">
                                                    <input
                                                        type='checkbox'
                                                        className='form-control'
                                                        id='isActive'
                                                        name='updateIsActive'
                                                        placeholder='Enter your username'
                                                        checked={row.isActive}
                                                        readOnly />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button variant="contained" onClick={openRecord} id={row._id} name={row.name}> View</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                        </Item>
                    </Grid>
                </Grid>
            </Box>

            {/* ADD NEW USER MODAL */}
            <Modal
                isOpen={modal}
                onRequestClose={() => setModal(false)}
                style={customStyles}
            >
                <div>
                    <section className='heading'>
                        <h1>
                            <p>ADD NEW USER</p>
                        </h1>
                    </section>
                    <div>
                        <section className='form'>
                            <form onSubmit={onSubmitCreate}>
                                <div className='form-group'>
                                    <label>First Name</label>
                                    <input
                                        type='text'
                                        className='form-control'
                                        id='newFirstName'
                                        name='newFirstName'
                                        value={newUser.newFirstName}
                                        onChange={onChangeNew}
                                        required
                                    />
                                </div>
                                <div className='form-group'>
                                    <label>Last Name</label>
                                    <input
                                        type='text'
                                        className='form-control'
                                        id='newLastName'
                                        name='newLastName'
                                        value={newUser.newLastName}
                                        onChange={onChangeNew}
                                        required
                                    />
                                </div>
                                <div className='form-group'>
                                    <label>Username</label>
                                    <input
                                        type='text'
                                        className='form-control'
                                        id='newUsername'
                                        name='newUsername'
                                        value={newUser.newUsername}
                                        onChange={onChangeNew}
                                        required
                                    />
                                </div>
                                <div className='form-group'>
                                    <label>User Type</label>
                                    <Select id='newRecordType'
                                        name='newRecordType'
                                        options={RecordType}
                                        onChange={onChangeDropdownNew}
                                        className='form-control'
                                        value={RecordType.filter(({ value }) => value === newUser.newRecordType)}
                                        required />
                                </div>
                                <div className='form-group'>
                                    <Button variant="contained" color="success" type='submit' fullWidth='true'>
                                        Save
                                    </Button>
                                </div>
                            </form>
                            <div className='form-group'>
                                <Button variant="outlined" color="error" fullWidth='true' onClick={() => setModal(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </section>
                    </div>
                </div>
            </Modal>

            {/* VIEW USER MODAL */}
            <Modal
                isOpen={viewModal}
                onRequestClose={() => setViewModal(true)}
                style={customStyles}
            >
                <div>
                    <section className='heading'>
                        <h1>
                            <p>USER DETAIL</p>
                        </h1>
                    </section>
                    <div>
                        <section className='form'>
                            <form onSubmit={onSubmitUpdate}>
                                <div className='form-group'>
                                    <label>First Name</label>
                                    <input
                                        type='text'
                                        className='form-control'
                                        id='updateFirstName'
                                        name='updateFirstName'
                                        value={updateUser.updateFirstName}
                                        onChange={onChangeUpdate}
                                        required
                                    />
                                </div>
                                <div className='form-group'>
                                    <label>Last Name</label>
                                    <input
                                        type='text'
                                        className='form-control'
                                        id='updateLastName'
                                        name='updateLastName'
                                        value={updateUser.updateLastName}
                                        onChange={onChangeUpdate}
                                        required
                                    />
                                </div>
                                <div className='form-group'>
                                    <label>Username</label>
                                    <input
                                        type='text'
                                        className='form-control'
                                        id='updateUsername'
                                        name='updateUsername'
                                        value={updateUser.updateUsername}
                                        onChange={onChangeUpdate}
                                        required
                                    />
                                </div>
                                <div className='form-group'>
                                    <label>User Type</label>
                                    <Select id='updateRecordType'
                                        name='updateRecordType'
                                        options={RecordType}
                                        onChange={onChangeDropdownUpdate}
                                        className='form-control'
                                        value={RecordType.filter(({ value }) => value === updateUser.updateRecordType)}
                                        required />
                                </div>
                                <div className='form-group'>
                                    <label>Is Active?</label>
                                    <input
                                        type='checkbox'
                                        className='form-control'
                                        id='updateIsActive'
                                        name='updateIsActive'
                                        placeholder='Enter your username'
                                        checked={updateUser.updateIsActive}
                                        onChange={onChangeCheckbox}
                                    />
                                </div>
                                <div className='form-group'>
                                    <Button variant="contained" color="success" type='submit' fullWidth='true'>
                                        Update
                                    </Button>
                                </div>

                            </form>
                            <div className='form-group'>
                                <Box sx={{ mt: 1 }}>
                                    <Button variant="outlined" color="error" fullWidth='true' onClick={() => setResetModal(true)}>
                                        Reset Password
                                    </Button>
                                </Box>
                                <Box sx={{ mt: 1 }}>
                                    <Button variant="outlined" color="error" fullWidth='true' onClick={() => setViewModal(false)}>
                                        Cancel
                                    </Button>
                                </Box>
                            </div>
                        </section>
                    </div>
                </div>
            </Modal>

            {/* RESET PASSWORD MODAL */}
            <Modal
                isOpen={resetModal}
                onRequestClose={() => setResetModal(false)}
                style={customStyles}
            >
                <div>
                    <section className='heading'>
                        <h1>
                            <p>Reset Password</p>
                        </h1>
                    </section>
                    <div>
                        <h1>
                            <p>Are you sure you want to Proceed?</p>
                        </h1>
                    </div>
                </div>

                <Box sx={{ m: 1 }}>
                    <Button sx={{ mx: 1 }} variant="contained" color="error" onClick={() => setResetModal(false)}>
                        Reset Password
                    </Button>
                    <Button sx={{ mx: 1 }} variant="outlined" color="error" onClick={() => setResetModal(false)}>
                        Cancel
                    </Button>
                </Box>
            </Modal>
        </>
    )
}


export default MaintenanceUser

