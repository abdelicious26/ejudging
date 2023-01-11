import { useState, useEffect, componentDidMount } from 'react'
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
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { set } from 'mongoose'

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

Modal.setAppElement('#root')
function MaintenanceCriteria() {
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
    const [allCriteria, setAllCriteria] = useState([]);
    const [newCriteria, setNewCriteria] = useState({
        newName: '',
        newDescription: '',
        newPercent: '',
    });
    const [modal, setModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const { newName, newDescription } = newCriteria
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    let token
    let selectedCriteria = {};
    if (!user) {
        navigate('/login')
    }
    else if (user && user.recordType !== 'admin') {
        navigate('/judge')
    }
    else {
        token = user.token
    }
    useEffect(() => {
        axios.get(
            `${process.env.REACT_APP_BACKEND_API}criteria/`,
            { headers: { "Authorization": `Bearer ${token}` } })
            .then(response => {
                if (!response) setAllCriteria("No Criteria Records")
                setAllCriteria(response.data);
                console.log(response.data)
            })
    }, [])
    //@UPDATE CRITERIA RECORD -------------------------------------------
    const [updateCriteria, setUpdateCriteria] = useState({
        updateId: '',
        updateName: '',
        updateDescription: '',
        updateIsActive: true
    });
    const { updateId, updateName, updateDescription, updateIsActive } = updateCriteria

    const openRecord = (event) => {
        //console.log(event.target.id)
        selectedCriteria = event.target.id;
        let result = allCriteria.find(({ _id }) => _id === selectedCriteria);
        setViewModal(true);
        console.log(result.description)
        setUpdateCriteria({
            updateId: result._id,
            updateName: result.name,
            updateDescription: result.description,
            updateIsActive: result.isActive,
        })
        console.log(updateCriteria)
    }

    //ONCHANGE FUNCTIONS
    const onChangeNew = (e) => {
        setNewCriteria((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }))
    }
    const onChangeUpdate = (e) => {
        setUpdateCriteria((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }))
    }
    const onChangeCheckbox = (e) => {
        setUpdateCriteria((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.checked,
        }))
        console.log(e.target.checked)
    }

    //ONCLICK FUNCTIONS
    const onSubmitCreate = (e) => {
        e.preventDefault()
        let URL = 'http://localhost:5000/api/criteria/'
        console.log(URL)
        console.log(newName)
        console.log(newDescription)
        axios.post(
            `${process.env.REACT_APP_BACKEND_API}criteria/`,
            {
                name: newName,
                description: newDescription
            },
            { headers: { "Authorization": `Bearer ${token}` } })
            .then((response) => {
                console.log('success')
                toast.success('Save Success');
                setNewCriteria({
                    newName: '',
                    newDescription: ''
                })
                axios.get(
                    `${process.env.REACT_APP_BACKEND_API}criteria/`,
                    { headers: { "Authorization": `Bearer ${token}` } })
                    .then(response => {
                        if (!response) setAllCriteria("No Criteria Records")
                        setAllCriteria(response.data);
                        console.log(response.data)
                    })
            })
            .catch((error) => {
                toast.error('Sorry, there was an error. the Name might be already existing.');
            })
    }
    const onSubmitUpdate = (e) => {
        e.preventDefault()
        let URL = 'http://localhost:5000/api/criteria/' + updateId
        if (!updateId) {
            return toast.error('Please select a criteria record');
        }
        console.log(URL)
        axios.put(
            `${process.env.REACT_APP_BACKEND_API}criteria/${updateId}`,
            {
                name: updateName,
                description: updateDescription,
                isActive: updateIsActive
            },
            { headers: { "Authorization": `Bearer ${token}` } })
            .then((response) => {
                console.log('success')
                toast.success('Update Success');
                setUpdateCriteria({
                    updateId: '',
                    updateName: '',
                    updateDescription: '',
                    updateIsActive: false
                })
                console.log(updateCriteria)
                axios.get(
                    `${process.env.REACT_APP_BACKEND_API}criteria/`,
                    { headers: { "Authorization": `Bearer ${token}` } })
                    .then(response => {
                        if (!response) setAllCriteria("No Criteria Records")
                        setAllCriteria(response.data);
                        console.log(response.data)
                    })
                setViewModal(false);
            })
            .catch((error) => {
                toast.error(error.response.data);
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
                                    List of Criteria
                                </h1>
                                <Grid container justify="flex-end">
                                    <Button variant="contained" color="success" size="large" onClick={() => setModal(true)} startIcon={<AddIcon />}>
                                        Add
                                    </Button>
                                </Grid>
                            </section>

                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="left" sx={{ fontSize: 18, fontWeight: 'bold' }}>Name</TableCell>
                                            <TableCell align="left" sx={{ fontSize: 18, fontWeight: 'bold' }}>Description</TableCell>
                                            <TableCell align="left" sx={{ fontSize: 18, fontWeight: 'bold' }}>Active?</TableCell>
                                            <TableCell align="left" sx={{ fontSize: 18, fontWeight: 'bold' }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {allCriteria.map((row) => (
                                            <TableRow
                                                key={row._id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell align="left">{row.name}</TableCell>
                                                <TableCell align="left">{row.description}</TableCell>
                                                <TableCell align="left">
                                                    <input
                                                        type='checkbox'
                                                        className='form-control'
                                                        id='isActive'
                                                        name='updateIsActive'
                                                        placeholder='Enter your username'
                                                        checked={row.isActive}
                                                        readOnly />
                                                </TableCell>
                                                <TableCell align="left">
                                                    {/* <button onClick={openRecord} id={row._id} name={row.name} className='btn'>View</button> */}
                                                    {/* <button className='btn' onClick={openRecord} id={row._id} name={row.name}>
                                                        View
                                                    </button> */}
                                                    <Button variant="contained" color="success" onClick={openRecord} id={row._id} name={row.name} startIcon={<EditIcon />}> Edit</Button>
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

            {/* NEW CRITERIA MODAL */}
            <Modal
                isOpen={modal}
                onRequestClose={() => setModal(false)}
                style={customStyles}
            >
                <div>
                    <section className='heading'>
                        <h1>
                            <p>ADD NEW CRITERIA</p>
                        </h1>
                    </section>
                    <div>
                        <section className='form'>
                            <form onSubmit={onSubmitCreate}>
                                <div className='form-group'>
                                    <label>Criteria Name</label>
                                    <input
                                        type='string'
                                        className='form-control'
                                        id='newName'
                                        name='newName'
                                        value={newCriteria.newName}
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
                                        value={newCriteria.newDescription}
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

            {/* UPDATE CRITERIA MODAL */}
            <Modal
                isOpen={viewModal}
                onRequestClose={() => setViewModal(false)}
                style={customStyles}
            >
                <div>
                    <section className='heading'>
                        <h1>
                            <p>CRITERIA DETAIL</p>
                        </h1>
                    </section>
                    <div>
                        <section className='form'>
                            <form onSubmit={onSubmitUpdate}>
                                <div className='form-group'>
                                    <label>Criteria Name</label>
                                    <input
                                        type='string'
                                        className='form-control'
                                        id='updateName'
                                        name='updateName'
                                        value={updateCriteria.updateName}
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
                                        value={updateCriteria.updateDescription}
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
                                        checked={updateCriteria.updateIsActive}
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


export default MaintenanceCriteria

