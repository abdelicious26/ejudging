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
    const [eventResult, setEventResult] = useState([]);

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
                })
            axios.get(
                'http://localhost:5000/api/users/',
                { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                    if (!response) setAllJudge("No User Records")
                    setAllJudge(response.data);
                })
            axios.get(
                'http://localhost:5000/api/participant/',
                { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                    if (!response) setAllParticipants("No User Records")
                    setAllParticipants(response.data);
                })
            axios.get(
                'http://localhost:5000/api/criteria/',
                { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                    if (!response) setAllCriteria("No User Records")
                    setAllCriteria(response.data);
                })
        }
    }, [])

    useEffect(() => {

        const isEmpty = Object.keys(selectedEvent).length === 0;
        if (!isEmpty) {
            //@ GET CRITERIA WITH NAME
            let CriteriaWithName = []
            selectedEvent.criteria.forEach(response => {
                const found = allCriteria.find(element => element._id === response.criteriaId);
                found.percent = response.percent
                CriteriaWithName.push(found)
            });
            setSelectedCriteria(CriteriaWithName)

            //@ GET PARTICIPANTS WITH NAME
            let ParticipantsWithName = []
            selectedEvent.participant.forEach(response => {
                const found = allParticipants.find(element => element._id === response.participantId);
                ParticipantsWithName.push(found)
            });
            setSelectedParticipants(ParticipantsWithName)

            //@ GET JUDGE WITH NAME
            let JudgeWithName = []
            selectedEvent.judge.forEach(response => {
                const found = allJudge.find(element => element._id === response.userId);
                JudgeWithName.push(found)
            });
            setSelectedJudge(JudgeWithName)
            let AllEventScore = []
            URL = 'http://localhost:5000/api/events/detail/result/' + selectedEvent._id
            axios.get(
                URL,
                { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                    if (!response) return
                    AllEventScore = response.data

                    AllEventScore = AllEventScore.map(result => {
                        const found = allCriteria.find(element => element._id === result.criteria);
                        const percent = selectedEvent.criteria.find(element => element.criteriaId === found._id);
                        return { ...result, criteriaName: found.name, percent: percent.percent }
                    })

                    AllEventScore = AllEventScore.map(result => {
                        const found = allJudge.find(element => element._id === result.judge);
                        return { ...result, judgeName: `${found.firstName} ${found.lastName}` }
                    })

                    let ParticipantsWithScore = []
                    ParticipantsWithName.forEach(participant => {
                        let participantRecord = []
                        AllEventScore.forEach(data => {
                            if (participant._id === data.participant) participantRecord.push(data)
                        })

                        let tempParticipantRecord = participant
                        tempParticipantRecord.score = participantRecord
                        ParticipantsWithScore.push(tempParticipantRecord)
                    })

                    ParticipantsWithScore = ParticipantsWithScore.map(participant => {
                        console.log('Participant')
                        let scorePerJudge = []
                        JudgeWithName.forEach(judge => {
                            let scoreObject = {}
                            let scoreFilter = participant.score.filter(judgescore => {
                                return judgescore.judge === judge._id
                            })
                            let tempTotal = 0
                            scoreFilter.forEach(data => {
                                tempTotal += data.score * data.percent / 100
                            })

                            scoreObject.judge = judge
                            scoreObject.totalScore = tempTotal
                            scorePerJudge.push(scoreObject)
                        })
                        return { ...participant, scoreJudge: scorePerJudge }
                    })
                    console.log(ParticipantsWithScore)
                    setEventResult(ParticipantsWithScore)
                    console.log(eventResult)
                })
        }
    }, [selectedEvent])

    //@UPDATE User RECORD -------------------------------------------

    //@ONCHANGE FUNCTIONS
    const onChangeCheckbox = (e) => {
        setSelectedEvent((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.checked,
        }))
    }

    //@ONCLICK FUNCTIONS
    const onClickView = (event) => {
        setModal(true)
        const found = allEvents.find(element => element._id === event.target.id);
        setSelectedEvent(found)
    }

    const onClickUpdateStatus = (event => {
        let URL = 'http://localhost:5000/api/events/detail/' + selectedEvent._id
        if (!selectedEvent._id) {
            return toast.error('Sorry. There was an error on your request.');
        }
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
    const showEventResult = () => {
        return (
            <>
                <ModalUI
                    open={resultModal}
                    onClose={() => setResultModal(false)}
                    aria-labelledby="child-modal-title"
                    aria-describedby="child-modal-description"
                >
                    <Box sx={{ ...style, width: 1000 }}>
                        <h3>Event Name:</h3>
                        <h2 id="child-modal-title">{selectedEvent.name}</h2>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="left">First Name</TableCell>
                                        <TableCell align="left">Judge Scores</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {eventResult.map((row) => (
                                        <TableRow
                                            key={row._id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >

                                            <TableCell align="left">{row.name}</TableCell>
                                            {row.scoreJudge.map((scoreJudge) => (
                                                <TableCell key={scoreJudge.judge._id} align="right">
                                                    <TextField
                                                        name={scoreJudge._id}
                                                        label={`${scoreJudge.judge.firstName} ${scoreJudge.judge.lastName}`}
                                                        value={scoreJudge.totalScore}
                                                        type="number"
                                                        inputProps={{ inputMode: 'numeric', pattern: '[1-100]*' }}
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                        variant="outlined"
                                                        readOnly
                                                    />
                                                </TableCell>
                                            ))}

                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Button onClick={() => setResultModal(false)} variant='outlined' color='error'>Close Result</Button>
                        <Button startIcon={<Print />} variant='contained' color='success'>Print Result</Button>
                    </Box>
                </ModalUI>
            </>
        )
    }

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
                            <Button onClick={() => { setResultModal(true) }} variant="outlined" color="success" startIcon={<PreviewIcon />}>
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
                                            <TableCell align="left">Criteria Name</TableCell>
                                            <TableCell align="left">Description</TableCell>
                                            <TableCell align="left">Percent</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedCriteria.map((row) => (
                                            <TableRow
                                                key={row._id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell align="left">{row.name}</TableCell>
                                                <TableCell align="left">{row.description}</TableCell>
                                                <TableCell align="left">{row.percent}</TableCell>
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
                                            <TableCell align="left">First Name</TableCell>
                                            <TableCell align="left">Last Name</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedJudge.map((row) => (
                                            <TableRow
                                                key={row._id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell align="left">{row.firstName}</TableCell>
                                                <TableCell align="left">{row.lastName}</TableCell>
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
                                            <TableCell align="left">Participant Name</TableCell>
                                            <TableCell align="left">Description</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedParticipants.map((row) => (
                                            <TableRow
                                                key={row._id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell align="left">{row.name}</TableCell>
                                                <TableCell align="left">{row.description}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </section>
                        <Button onClick={() => setModal(false)} variant="outlined" color="error">
                            Close
                        </Button>
                        {showEventResult()}
                    </Box>
                </ModalUI>
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