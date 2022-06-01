import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Spinner from '../components/Spinner'
import axios from 'axios'
import { toast } from 'react-toastify'
import Modal from 'react-modal'
import ModalUI from '@mui/material/Modal';
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
import TextField from '@mui/material/TextField';
import Print from '@mui/icons-material/Print';
import PreviewIcon from '@mui/icons-material/Preview';
const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));
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

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 1000,
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

Modal.setAppElement('#root')
function LatestEvents() {
    const [allEvents, setAllEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState({});
    const [allParticipants, setAllParticipants] = useState([]);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [allJudge, setAllJudge] = useState([]);
    const [selectedJudge, setSelectedJudge] = useState([]);
    const [allCriteria, setAllCriteria] = useState([]);
    const [selectedCriteria, setSelectedCriteria] = useState([]);
    const [modal, setModal] = useState(false);
    const [resultModal, setResultModal] = useState(false);

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    let token;

    useEffect(() => {
        if (!user) {
            navigate('/login')
        }
        else if (user && user.recordType !== 'admin') {
            navigate('/judge')
        }
        else {
            token = user.token
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
        }
    }, [])

    useEffect(() => {
        if (selectedEvent.length != 0) {
            console.log('binasa agad')
            console.log(selectedEvent)
        }
        if (!selectedEvent) {
            console.log('walang pinili')
        }

        const isEmpty = Object.keys(selectedEvent).length === 0;
        console.log(isEmpty); // 👉️ true
        if (!isEmpty) {
            //@ GET CRITERIA WITH NAME
            let CriteriaWithName = []
            selectedEvent.criteria.forEach(response => {
                const found = allCriteria.find(element => element._id === response.criteriaId);
                found.percent = response.percent
                CriteriaWithName.push(found)
            });
            setSelectedCriteria(CriteriaWithName)
            console.log(selectedCriteria)

            //@ GET PARTICIPANTS WITH NAME
            let ParticipantsWithName = []
            selectedEvent.participant.forEach(response => {
                const found = allParticipants.find(element => element._id === response.participantId);
                ParticipantsWithName.push(found)
            });
            setSelectedParticipants(ParticipantsWithName)
            console.log(selectedParticipants)

            //@ GET JUDGE WITH NAME
            let JudgeWithName = []
            selectedEvent.judge.forEach(response => {
                const found = allJudge.find(element => element._id === response.userId);
                JudgeWithName.push(found)
            });
            setSelectedJudge(JudgeWithName)
            console.log(selectedJudge)
        }
    }, [selectedEvent])
    //console.log(allEvents);


    //@UPDATE User RECORD -------------------------------------------

    //ONCHANGE FUNCTIONS

    const onChangeCheckbox = (e) => {
        setSelectedEvent((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.checked,
        }))
        console.log(e.target.checked)
    }

    //ONCLICK FUNCTIONS
    const onClickView = (event) => {
        setModal(true)
        const found = allEvents.find(element => element._id === event.target.id);
        console.log(found)
        setSelectedEvent(found)
    }

    const onClickUpdateStatus = (event => {
        console.log(selectedEvent)
        let URL = 'http://localhost:5000/api/events/detail/' + selectedEvent._id
        if (!selectedEvent._id) {
            return toast.error('Sorry. There was an error on your request.');
        }
        console.log(URL)
        axios.put(
            URL,
            {
                name: selectedEvent.name,
                description: selectedEvent.description,
                venue: selectedEvent.venue,
                dateTime: selectedEvent.dateTime,
                isActive: selectedEvent.isActive,
                IsOnGoing: selectedEvent.IsOnGoing
            },
            { headers: { "Authorization": `Bearer ${token}` } })
            .then((response) => {
                console.log('success')
                toast.success('Update Success');
            })
            .catch((error) => {
                toast.error(error.response.data);
            })
    })

    //@SHOW FORMS
    const ShowEvent = () => {
        return (
            <>
                <ModalUI
                    open={modal}
                    onClose={() => setModal(false)}
                    aria-labelledby="parent-modal-title"
                    aria-describedby="parent-modal-description"
                    className={modalStyle}
                >
                    <Box sx={{ ...style }}>
                        <section>
                            <h1>
                                Event Info:
                            </h1>
                            <TextField
                                id="outlined-read-only-input"
                                label="Event Name"
                                defaultValue={selectedEvent.name}
                                InputProps={{
                                    readOnly: true,
                                }} fullWidth margin="dense"
                            />

                            <TextField
                                id="outlined-read-only-input"
                                label="Description"
                                defaultValue={selectedEvent.description}
                                InputProps={{
                                    readOnly: true,
                                }} fullWidth margin="dense"
                            />

                            <TextField
                                id="outlined-read-only-input"
                                label="Venue"
                                defaultValue={selectedEvent.venue}
                                InputProps={{
                                    readOnly: true,
                                }} fullWidth margin="dense"
                            />

                            <TextField
                                id="outlined-read-only-input"
                                label="Date and Time"
                                defaultValue={selectedEvent.dateTime}
                                InputProps={{
                                    readOnly: true,
                                }} fullWidth margin="dense"
                            />

                            <div>
                                On Going Event?
                                <Switch
                                    checked={selectedEvent.IsOnGoing}
                                    inputProps={{ 'aria-label': 'controlled' }}
                                    name='IsOnGoing'
                                    onChange={onChangeCheckbox}
                                />
                            </div>
                            <Button onClick={onClickUpdateStatus} variant="contained" color="success">
                                Update Event Status
                            </Button>
                            <Button onClick={() => { setResultModal(true); console.log(resultModal) }} variant="outlined" color="success" startIcon={<PreviewIcon />}>
                                View Result
                            </Button>
                        </section>

                        <section>
                            <h1>
                                Criteria:
                            </h1>
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="right">Criteria Name</TableCell>
                                            <TableCell align="right">Description</TableCell>
                                            <TableCell align="right">Percent</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedCriteria.map((row) => (
                                            <TableRow
                                                key={row._id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell align="right">{row.name}</TableCell>
                                                <TableCell align="right">{row.description}</TableCell>
                                                <TableCell align="right">{row.percent}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </section>

                        <section>
                            <h1>
                                Judges:
                            </h1>
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="right">First Name</TableCell>
                                            <TableCell align="right">Last Name</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedJudge.map((row) => (
                                            <TableRow
                                                key={row._id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell align="right">{row.firstName}</TableCell>
                                                <TableCell align="right">{row.lastName}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </section>

                        <section>
                            <h1>
                                Participants:
                            </h1>
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="right">Participant Name</TableCell>
                                            <TableCell align="right">Description</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedParticipants.map((row) => (
                                            <TableRow
                                                key={row._id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell align="right">{row.name}</TableCell>
                                                <TableCell align="right">{row.description}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </section>
                        <Button onClick={() => setModal(false)} variant="outlined" color="error">
                            Close
                        </Button>
                        <ModalUI
                            open={resultModal}
                            onClose={() => setResultModal(false)}
                            aria-labelledby="child-modal-title"
                            aria-describedby="child-modal-description"
                        >
                            <Box sx={{ ...style, width: 1000 }}>
                                <h3>
                                    Event Name:
                                </h3>
                                <h2 id="child-modal-title">{selectedEvent.name}</h2>
                                <Button onClick={() => setResultModal(false)} variant='outlined' color='error'>Close Result</Button>
                                <Button startIcon={<Print />} variant='contained' color='success'>Print Result</Button>
                            </Box>
                        </ModalUI>
                    </Box>
                </ModalUI>
            </>
        )
    }


    const showEventResult = () => {
        return (
            <>
            </>
        )
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
                                                    id='isOnGoing'
                                                    name='isOnGoing'
                                                    checked={row.IsOnGoing}
                                                    readOnly />
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


            {ShowEvent()}
        </>
    )
}


export default LatestEvents