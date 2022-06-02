import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { toast } from 'react-toastify'
import Modal from 'react-modal'
import ModalUI from '@mui/material/Modal';
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
function Judge() {
    const [allEvents, setAllEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState({});
    const [allParticipants, setAllParticipants] = useState([]);
    const [allJudge, setAllJudge] = useState([]);
    const [allCriteria, setAllCriteria] = useState([]);
    const [modal, setModal] = useState(false);
    const [resultModal, setResultModal] = useState(false);
    const [viewEvent, setViewEvent] = useState(false);
    const [score, setScore] = useState([])

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    let token;

    useEffect(() => {
        if (!user) {
            navigate('/login')
        }
        else if (user && user.recordType !== 'judge') {
            navigate('/')
        }
        else {
            token = user.token
            console.log(token)
            axios.get(
                'http://localhost:5000/api/judge/',
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
        // setViewEvent(Object.keys(selectedEvent).length === 0);
        console.log(selectedEvent)
        //const tempEvent = selectedEvent
        // console.log(tempEvent)
        console.log(viewEvent)
        if (viewEvent) {
            console.log('nakikita ako')

            //@ GET CRITERIA WITH NAME
            let CriteriaWithName = []
            selectedEvent.criteria.forEach(response => {
                const found = allCriteria.find(element => element._id === response.criteriaId);
                found.percent = response.percent
                CriteriaWithName.push(found)
            });
            console.log(CriteriaWithName)

            //@ GET PARTICIPANTS WITH NAME
            let ParticipantsWithName = []
            selectedEvent.participant.forEach(response => {
                const found = allParticipants.find(element => element._id === response.participantId);
                ParticipantsWithName.push(found)
            });
            console.log(ParticipantsWithName)

            //@ PARTICIPANT WITH CRITERIA AND SCORE
            const criteriaWithScore = CriteriaWithName.map(criteria => {
                return { ...criteria, score: '' };
            });
            let participantList = ParticipantsWithName.map(participant => {
                return { ...participant, criteria: criteriaWithScore, total: '', };
            });
            //console.log(participantList)
            setScore(participantList)
            console.log(participantList)
            console.log(score)
        }
    }, [selectedEvent])

    //@UPDATE Judge Score -------------------------------------------
    //@ONCHANGE FUNCTIONS
    const onChangeScore = (event) => {
        let TemporaryScore = event.target.value
        if (TemporaryScore === '') TemporaryScore = ''
        else if (parseInt(TemporaryScore) < 1) TemporaryScore = 1
        else if (parseInt(TemporaryScore) > 100) TemporaryScore = 100
        else TemporaryScore = parseInt(TemporaryScore)

        //@Check if Event is On Going
        if (selectedEvent.IsOnGoing) {
            let tempTotal = 0;
            const tempParticipant = score.find(element => element._id === event.target.id)
            const tempScore = tempParticipant.criteria.map(element => {
                if (element._id === event.target.name) {
                    tempTotal += (TemporaryScore * element.percent / 100)
                    console.log(tempTotal)
                    console.log(element.score)
                    return { ...element, score: TemporaryScore };
                }
                else {
                    if(element.score) tempTotal += (parseInt(element.score) * element.percent / 100)
                    else if(!element.score) console.log('walang laman')
                    
                    console.log(tempTotal)
                    console.log(element.score)
                    return element
                }
            });
            tempParticipant.criteria = tempScore
            tempParticipant.total = tempTotal

            let tempScoreList = score.map(scoreRecord => {
                if (scoreRecord._id === scoreRecord._id) return { ...scoreRecord, tempParticipant }
                return scoreRecord
            }
            )
            setScore(tempScoreList)
            //console.log(tempTotal)


        }
    }
    //@ONCLICK FUNCTIONS
    const onClickView = (event) => {
        const found = allEvents.find(element => element._id === event.target.id);
        setSelectedEvent(found)
        //console.log(selectedEvent)
        setViewEvent(true);
        setModal(true)
    }

    //@ONSUBMIT FUNCTIONS
    const onSubmitScore = (event) => {
        event.preventDefault()
        let URL = 'http://localhost:5000/api/judge/event/' + selectedEvent._id
        if (!selectedEvent._id) {
            return toast.error('You have not selected any event');
        }
        else {


            score.forEach(participant => {
                // axios.put(
                //     URL,
                //     {
                //         participant: participant._id,
                //         criteria: '6294734552f5c21710986b85',
                //         score: 69
                //     },
                //     { headers: { "Authorization": `Bearer ${user.token}` } })
                //     .then(response => {
                //         console.log(response)
                //         console.log('Score Saved')
                //     })
                //     .catch((error) => {
                //         console.log(error)
                //     })
                participant.criteria.forEach(scoreRecord => {
                    console.log(scoreRecord.score)
                    axios.put(
                        URL,
                        {
                            participant: participant._id,
                            criteria: scoreRecord._id,
                            score: scoreRecord.score
                        },
                        { headers: { "Authorization": `Bearer ${user.token}` } })
                        .then(response => {
                        })
                        .catch((error) => {
                            console.log(error)
                        })
                    // console.log(participant._id)
                    // console.log(scoreRecord._id)
                    // console.log(scoreRecord.score)
                    // axios.put(
                    //     URL,
                    //     {
                    //         participant: participant._id,
                    //         criteria: scoreRecord._id,
                    //         score: scoreRecord.score
                    //     },
                    //     { headers: { "Authorization": `Bearer ${user.token}` } })
                    //     .catch((error) => {
                    //         console.log(error)
                    //     })

                    // axios.put(
                    //     URL,
                    //     {
                    //         participant: participant._id,
                    //         criteria: scoreRecord._id,
                    //         score: scoreRecord.score
                    //     },
                    //     { headers: { "Authorization": `Bearer ${user.token}` } })
                    //     .catch((error) => {
                    //         console.log(error)
                    //         toast.error(error.response.data);
                    //     })
                })
            })

            console.log('Score Saved')
            toast.success('Your scores have been saved.');
        }
    }

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
                                    readOnly
                                />
                            </div>
                        </section>

                        <section>
                            <h1>
                                Participants:
                            </h1>
                            <form onSubmit={onSubmitScore}>
                                <TableContainer component={Paper}>
                                    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="right">Participant Name</TableCell>
                                                <TableCell align="right">Criteria</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {score.map((row) => (
                                                <TableRow
                                                    key={row._id}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <TableCell align="right">{row.name}</TableCell>
                                                    {row.criteria.map((criteria) => (
                                                        <TableCell key={criteria._id} align="right">
                                                            <TextField
                                                                id={row._id}
                                                                name={criteria._id}
                                                                label={criteria.name + ' ' + criteria.percent + '%'}
                                                                value={criteria.score}
                                                                onChange={onChangeScore}
                                                                type="number"
                                                                inputProps={{ inputMode: 'numeric', pattern: '[1-100]*' }}
                                                                InputLabelProps={{
                                                                    shrink: true,
                                                                }}
                                                                variant="outlined"
                                                                required
                                                            />
                                                        </TableCell>
                                                    ))}

                                                    <TableCell align="right">
                                                        <TextField
                                                            id={row._id}
                                                            name='total'
                                                            label='TOTAL SCORE'
                                                            value={row.total}
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}
                                                            readOnly
                                                            variant="filled"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Button type='submit' variant="outlined" color="success">
                                    Submit Score
                                </Button>
                            </form>
                        </section>
                        <Button onClick={() => setModal(false)} variant="outlined" color="error">
                            Close
                        </Button>
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


export default Judge