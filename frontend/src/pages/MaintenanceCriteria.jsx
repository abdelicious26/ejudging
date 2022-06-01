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
            'http://localhost:5000/api/criteria/',
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
            URL,
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
                setUpdateCriteria({
                    updateId: '',
                    updateName: '',
                    updateDescription: '',
                    updateIsActive: false
                })
                console.log(updateCriteria)
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
                    <Grid item xs={7}>
                        <Item>
                            <section className='heading'>
                                <h1>
                                    List of Criteria
                                </h1>
                                <button onClick={() => setModal(true)} className='btn'>
                                    Add New
                                </button>
                            </section>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Active?</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        allCriteria.map(data => {
                                            return (
                                                <tr key={data._id}>
                                                    <td>{data.name}</td>
                                                    <td>{data.description}</td>
                                                    <td>
                                                        <input
                                                            type='checkbox'
                                                            className='form-control'
                                                            id='isActive'
                                                            name='updateIsActive'
                                                            placeholder='Enter your username'
                                                            checked={data.isActive}
                                                            readOnly />
                                                    </td>
                                                    <td><button onClick={openRecord} id={data._id} name={data.name} className='btn btn-block'>View</button></td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </Item>
                    </Grid>
                    <Grid item xs={5}>
                        <Item>
                            <div>
                                <section className='heading'>
                                    <h1>
                                        <p>Criteria Detail</p>
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
                                                <button type='submit' className='btn btn-block'>
                                                    Update
                                                </button>
                                            </div>
                                        </form>
                                    </section>
                                </div>
                            </div>
                        </Item>
                    </Grid>
                </Grid>
            </Box>


            <Modal
                isOpen={modal}
                onRequestClose={() => setModal(false)}
                style={customStyles}
            >
                <div>
                    <section className='heading'>
                        <h1>
                            <p>Add new Criteria</p>
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
                                    <button type='submit' className='btn btn-block'>
                                        Save
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                </div>
                <button onClick={() => setModal(false)} className='btn'>
                    Cancel
                </button>
            </Modal>
        </>
    )
}


export default MaintenanceCriteria

