import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Spinner from '../components/Spinner'
import axios from 'axios'
import { toast } from 'react-toastify'
import Modal from 'react-modal'
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
function MaintenanceParticipant() {
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

    //VARIABLES
    const [allParticipants, setAllParticipants] = useState([]);
    const [newParticipant, setNewParticipant] = useState({
        newName: '',
        newDescription: ''
    });
    const [modal, setModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const { newName, newDescription } = newParticipant
    const navigate = useNavigate()
    const dispatch = useDispatch()
    let selectedParticipant = {};
    const { user } = useSelector((state) => state.auth)
    let token = user.token
    useEffect(() => {
        if (!user) {
            navigate('/login')
        }
        else if (user && user.recordType !== 'admin') {
            navigate('/judge')
        }
        else {
        }
    }, [user, navigate])

    useEffect(() => {
        axios.get(
            'http://localhost:5000/api/participant/',
            { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                if (!response) setAllParticipants("No Participant Records")
                setAllParticipants(response.data);
                console.log(response.data)
            })
    }, [])

    //console.log(allParticipants);


    //@UPDATE PARTICIPANT RECORD -------------------------------------------
    const [updateParticipant, setUpdateParticipant] = useState({
        updateId: '',
        updateName: '',
        updateDescription: '',
        updateIsActive: true
    });
    const { updateId, updateName, updateDescription, updateIsActive } = updateParticipant

    //OPEN VIEW MODAL FUNCTION
    const openRecord = (event) => {
        //console.log(event.target.id)
        selectedParticipant = event.target.id;
        let result = allParticipants.find(({ _id }) => _id === selectedParticipant);
        setViewModal(true);
        console.log(result.description)
        setUpdateParticipant({
            updateId: result._id,
            updateName: result.name,
            updateDescription: result.description,
            updateIsActive: result.isActive,
        })
        console.log(updateParticipant)
    }

    //ONCHANGE FUNCTIONS
    const onChangeNew = (e) => {
        setNewParticipant((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }))
    }
    const onChangeUpdate = (e) => {
        setUpdateParticipant((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }))
    }
    const onChangeCheckbox = (e) => {
        setUpdateParticipant((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.checked,
        }))
        console.log(e.target.checked)
    }

    //ONCLICK FUNCTIONS
    //SAVE NEW PARTICIPANT BUTTON
    const onSubmitCreate = (e) => {
        e.preventDefault()
        let URL = 'http://localhost:5000/api/participant/'
        console.log(URL)
        console.log(newName)
        console.log(newDescription)
        axios.post(
            URL,
            {
                name: newName,
                description: newDescription
            },
            { headers: { "Authorization": `Bearer ${token}` } })
            .then((response) => {
                console.log('success')
                toast.success('Save Success');
                setNewParticipant({
                    newName: '',
                    newDescription: ''
                })
                // AUTO REFRESH TABLE
                axios.get(
                    'http://localhost:5000/api/participant/',
                    { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                        if (!response) setAllParticipants("No Participant Records")
                        setAllParticipants(response.data);
                        console.log(response.data)
                    })
            })
            .catch((error) => {
                toast.error('Sorry, there was an error. the Name might be already existing.');
            })
    }
    //SAVE UPDATE PARTICIPANT BUTTON
    const onSubmitUpdate = (e) => {
        e.preventDefault()
        let URL = 'http://localhost:5000/api/participant/' + updateId
        if (!updateId) {
            return toast.error('Please select a participant record');
        }
        console.log(URL)
        axios.put(
            URL,
            {
                name: updateName,
                description: updateDescription,
                isActive: updateIsActive
            },
            { headers: { "Authorization": `Bearer ${token}` } })
            .then((response) => {
                console.log('success')
                toast.success('Update Success');
                setUpdateParticipant({
                    updateId: '',
                    updateName: '',
                    updateDescription: '',
                    updateIsActive: false
                })
                console.log(updateParticipant)
                setViewModal(false);
                // AUTO REFRESH TABLE
                axios.get(
                    'http://localhost:5000/api/participant/',
                    { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                        if (!response) setAllParticipants("No Participant Records")
                        setAllParticipants(response.data);
                        console.log(response.data)
                    })
            })
            .catch((error) => {
                toast.error(error.response.data);
            })
    }

    let openModal = false;
    const OpenModal = (e) => {
        openModal = true;
        console.log(openModal)
    }
    const CloseModal = (e) => {
        openModal = false;
        console.log(openModal)
    }

    return (
        <>
            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Item>
                            <section className='heading'>
                                <h1>
                                    List of Participants
                                </h1>
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
                                            <TableCell align="right">Name</TableCell>
                                            <TableCell align="right">Description</TableCell>
                                            <TableCell align="right">Active?</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {allParticipants.map((row) => (
                                            <TableRow
                                                key={row._id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell align="right">{row.name}</TableCell>
                                                <TableCell align="right">{row.description}</TableCell>
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
                                                <TableCell align="right">
                                                    {/* <button onClick={openRecord} id={row._id} name={row.name} className='btn'>View</button> */}
                                                    {/* <button className='btn' onClick={openRecord} id={row._id} name={row.name}>
                                                        View
                                                    </button> */}
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

            {/* NEW PARTICIPANT MODAL */}
            <Modal
                isOpen={modal}
                onRequestClose={() => setModal(false)}
                style={customStyles}
            >
                <div>
                    <section className='heading'>
                        <h1>
                            <p>ADD NEW PARTICIPANT</p>
                        </h1>
                    </section>
                    <div>
                        <section className='form'>
                            <form onSubmit={onSubmitCreate}>
                                <div className='form-group'>
                                    <label>Participant Name</label>
                                    <input
                                        type='string'
                                        className='form-control'
                                        id='newName'
                                        name='newName'
                                        value={newParticipant.newName}
                                        onChange={onChangeNew}
                                        required
                                    />
                                </div>
                                <div className='form-group'>
                                    <label>Description</label>
                                    <input
                                        type='string'
                                        className='form-control'
                                        id='newDescription'
                                        name='newDescription'
                                        value={newParticipant.newDescription}
                                        onChange={onChangeNew}
                                    />
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

            {/* UPDATE PARTICIPANT MODAL */}
            <Modal
                isOpen={viewModal}
                onRequestClose={() => setViewModal(false)}
                style={customStyles}
            >
                <div>
                    <section className='heading'>
                        <h1>
                            <p>PARTICIPANT DETAIL</p>
                        </h1>
                    </section>
                    <div>
                        <section className='form'>
                            <form onSubmit={onSubmitUpdate}>
                                <div className='form-group'>
                                    <label>Participant Name</label>
                                    <input
                                        type='string'
                                        className='form-control'
                                        id='updateName'
                                        name='updateName'
                                        value={updateParticipant.updateName}
                                        onChange={onChangeUpdate}
                                        required
                                    />
                                </div>
                                <div className='form-group'>
                                    <label>Description</label>
                                    <input
                                        type='string'
                                        className='form-control'
                                        id='updateDescription'
                                        name='updateDescription'
                                        value={updateParticipant.updateDescription}
                                        onChange={onChangeUpdate}
                                    />
                                </div>
                                <div className='form-group'>
                                    <label>Is Active?</label>
                                    <input
                                        type='checkbox'
                                        className='form-control'
                                        id='updateIsActive'
                                        name='updateIsActive'
                                        placeholder='Enter your username'
                                        checked={updateParticipant.updateIsActive}
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
                                <Button variant="outlined" color="error" fullWidth='true' onClick={() => setViewModal(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </section>
                    </div>
                </div>
            </Modal>
        </>
    )
}


export default MaintenanceParticipant

