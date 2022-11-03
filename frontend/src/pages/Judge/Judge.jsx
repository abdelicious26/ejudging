import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { toast } from 'react-toastify'
import { styled } from '@mui/material/styles';
import { Modal, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button, Paper, Box, Switch, Grid } from '@mui/material';
import EventDetail from './EventDetail'

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));


const modalStyle = {
    position: 'absolute',
    top: '10%',
    left: '10%',
    overflow: 'scroll',
    height: '100%',
    display: 'block'
};

function Judge() {
    const [allEvents, setAllEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState({});
    const [allParticipants, setAllParticipants] = useState([]);
    const [allJudge, setAllJudge] = useState([]);
    const [allCriteria, setAllCriteria] = useState([]);
    const [modal, setModal] = useState(false);
    const [viewEvent, setViewEvent] = useState(false);
    const [participantModal, setParticipantModal] = useState(false);
    const [score, setScore] = useState([])

    const navigate = useNavigate()
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
            axios.get(
                'http://localhost:5000/api/judge/',
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
        if (viewEvent) {

            //@ GET CRITERIA WITH NAME
            let CriteriaWithName = []
            selectedEvent.criteria.forEach(response => {
                const found = allCriteria.find(element => element._id === response.criteriaId);
                found.percent = response.percent
                CriteriaWithName.push(found)
            });

            //@ GET PARTICIPANTS WITH NAME
            let ParticipantsWithName = []
            selectedEvent.participant.forEach(response => {
                const found = allParticipants.find(element => element._id === response.participantId);
                ParticipantsWithName.push(found)
            });

            //@ PARTICIPANT WITH CRITERIA AND SCORE
            const criteriaWithScore = CriteriaWithName.map(criteria => {
                return { ...criteria, score: '' };
            });
            let participantList = ParticipantsWithName.map(participant => {
                return { ...participant, criteria: criteriaWithScore, total: '', };
            });
            setScore(participantList)
        }
    }, [selectedEvent])

    //@UPDATE Judge Score -------------------------------------------
    //@ONCHANGE FUNCTIONS

    //@ONCLICK FUNCTIONS
    const onClickView = (event) => {
        const found = allEvents.find(element => element._id === event.target.id);
        setSelectedEvent(found)
        setViewEvent(true);
        setModal(true)
    }

    //@ONSUBMIT FUNCTIONS

    //@SHOW FORMS

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


            <Modal
                open={modal}
                onClose={() => setModal(false)}
                aria-labelledby="parent-modal-title"
                aria-describedby="parent-modal-description"
                className={modalStyle}
            >
                <EventDetail event={selectedEvent} participants={allParticipants} criteria={allCriteria} judges={allJudge} />
            </Modal>
        </>
    )
}


export default Judge