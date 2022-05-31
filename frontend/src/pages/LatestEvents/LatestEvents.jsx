import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Spinner from '../../components/Spinner/Spinner'
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
import Button from '@mui/material/Button';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Switch from '@mui/material/Switch';

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
    const [allEvents, setAllEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState({});
    const [allParticipants, setAllParticipants] = useState([]);
    const [selectedParticipants, setSelectedParticipants] = useState({});
    const [allJudge, setAllJudge] = useState({});
    const [selectedJudge, setSelectedJudge] = useState({});
    const [allCriteria, setAllCriteria] = useState([]);
    const [selectedCriteria, setSelectedCriteria] = useState({});
    const [modal, setModal] = useState(false);

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
            'http://localhost:5000/api/events/',
            { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                if (!response) setAllEvents("No Event Records")
                setAllEvents(response.data);
                console.log(response.data)
            })

        axios.get(
            'http://localhost:5000/api/users/',
            { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                if (!response) setAllJudge("No User Records")
                setAllJudge(response.data);
                console.log(response.data)
            })
        axios.get(
            'http://localhost:5000/api/participant/',
            { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                if (!response) setAllParticipants("No User Records")
                setAllParticipants(response.data);
                console.log(response.data)
            })
        axios.get(
            'http://localhost:5000/api/criteria/',
            { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                if (!response) setAllCriteria("No User Records")
                setAllCriteria(response.data);
                console.log(response.data)
            })


    }, [])

    //console.log(allEvents);


    //@UPDATE User RECORD -------------------------------------------

    //ONCHANGE FUNCTIONS

    //ONCLICK FUNCTIONS
    const onClickView = (event) => {
        setModal(true)
        //console.log(event.target.id)
        selectedUser = event.target.id;

        let result = allEvents.find(({ _id }) => _id === selectedUser);
        //console.log(result.description)
        setSelectedEvent(result)
        console.log(selectedEvent)

        let tempCriteriaList = {}
        selectedEvent.criteria.foreach(criteria => {
            const tempCriteria = allCriteria.map(criteria => {
                if (criteria._id === criteria.criteriaId) {
                    return { ...criteria, criteria};
                }
                return criteria;
            });
            tempCriteriaList.push(tempCriteria);
        });
        console.log(tempCriteriaList)
    }

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Item>
                        <section className='heading'>
                            <h1>
                                Latest Events
                            </h1>
                        </section>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="right">Event Name</TableCell>
                                        <TableCell align="right">Description</TableCell>
                                        <TableCell align="right">Venue</TableCell>
                                        <TableCell align="right">Date & Time</TableCell>
                                        <TableCell align="right">On Going?</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {allEvents.map((row) => (
                                        <TableRow
                                            key={row._id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            {/* <TableCell component="th" scope="row">
                                                    {row.name}
                                                </TableCell> */}

                                            <TableCell align="right">{row.name}</TableCell>
                                            <TableCell align="right">{row.description}</TableCell>
                                            <TableCell align="right">{row.venue}</TableCell>
                                            <TableCell align="right">{row.dateTime}</TableCell>
                                            <TableCell align="right">
                                                <input
                                                    type='checkbox'
                                                    className='form-control'
                                                    id='isActive'
                                                    name='updateIsActive'
                                                    placeholder='Enter your username'
                                                    checked={row.isOnGoing} />
                                            </TableCell>
                                            <TableCell>
                                                <Button id={row._id} variant="contained" onClick={onClickView}>View</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Item>
                </Grid>
            </Grid>

            <Modal
                isOpen={modal}
                onRequestClose={() => setModal(false)}
                style={customStyles}
            >
                <section>
                    <div>
                        Event Name: {selectedEvent.name}
                    </div>
                    <div>
                        Description: {selectedEvent.description}
                    </div>
                    <div>
                        Description: {selectedEvent.venue}
                    </div>
                    <div>
                        Date and Time: {selectedEvent.dateTime}
                    </div>
                    <div>
                        On Going Event? <Switch
                            checked={selectedEvent.isOnGoing}
                            inputProps={{ 'aria-label': 'controlled' }}
                        />
                    </div>
                </section>

                <button onClick={() => setModal(false)} className='btn'>
                    Cancel
                </button>
            </Modal>
        </>
    )
}


export default MaintenanceUser