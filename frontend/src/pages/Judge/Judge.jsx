import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import EventDetail from './EventDetail';
import { format } from "date-fns";

import { styled } from '@mui/material/styles';
import CircleIcon from '@mui/icons-material/Circle';
import { Modal, Stack, Paper, Box, Typography, TextField, Button, FormControl, Switch } from '@mui/material';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    height: '90%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    overflow: 'auto',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
};

const itemStyle = {
    bgcolor: 'background.paper',
    borderColor: 'text.primary',
    mh: 1,
    border: 1,
    width: '100%',
    height: '100%',
    borderRadius: '16px',
    boxShadow: 3
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
                `${process.env.REACT_APP_BACKEND_API}judge/`,
                { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                    if (!response) setAllEvents("No Event Records")
                    setAllEvents(response.data);
                })
            axios.get(
                `${process.env.REACT_APP_BACKEND_API}users/`,
                { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                    if (!response) setAllJudge("No User Records")
                    setAllJudge(response.data);
                })
            axios.get(
                `${process.env.REACT_APP_BACKEND_API}participant/`,
                { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                    if (!response) setAllParticipants("No User Records")
                    setAllParticipants(response.data);
                })
            axios.get(
                `${process.env.REACT_APP_BACKEND_API}criteria/`,
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
    const isEventActive = (isActive) => {
        if (isActive) {
            return <>

                <p><CircleIcon color="success" /> Active</p>
            </>
        }
        else {
            return <>
                <p><CircleIcon color="error" /> Inactive</p>
            </>
        }
    }

    //@ONCHANGE FUNCTIONS

    //@ONCLICK FUNCTIONS
    const onClickView = (event) => {
        const found = allEvents.find(element => element._id === event.target.id);
        setSelectedEvent(found)
        setViewEvent(true);
        setModal(true)
    }

    const handleCloseEvent = (value) => {
        setModal(false);
        console.log(value);
    };

    const formatDateAndTime = (value) => {
        const _date = Date.parse(value);
        return format(_date, "MMMM d, yyyy - h:mma");;
    };

    const handleCloseModal = (value) => {
        if (window.confirm('Are you sure you want to close? any unsaved changes will not be saved.')) {
            console.log('closing the modal');
            setModal(false);
        }
    };

    return (
        <>
            <section className='heading'>
                <h1>
                    <p>My Events</p>
                </h1>
            </section>

            {/* <TextField label={'Search Event Name'} id="margin-normal" fullWidth margin="normal" /> */}
            <Stack spacing={2}>
                {allEvents.map((eventRecord) => (
                    <Item key={eventRecord._id}
                        sx={{
                            ...itemStyle
                        }}
                    >
                        <Box>
                            <FormControl fullWidth>
                                {isEventActive(eventRecord.IsOnGoing)}
                                <TextField
                                    label="Event Name"
                                    defaultValue={eventRecord.name}
                                    inputProps={{
                                        readOnly: true, inputMode: 'date'
                                    }}
                                    // fullWidth 
                                    variant="outlined"
                                    size="medium"
                                    color="error"
                                    margin="dense"
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    label="Description"
                                    defaultValue={eventRecord.description}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    // fullWidth 
                                    variant="outlined"
                                    size="medium"
                                    color="error"
                                    margin="dense"
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    label="Venue"
                                    defaultValue={eventRecord.venue}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    // fullWidth 
                                    variant="outlined"
                                    size="medium"
                                    color="error"
                                    margin="dense"
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    label="Date & Time"
                                    defaultValue={formatDateAndTime(eventRecord.dateTime)}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    // fullWidth 
                                    variant="outlined"
                                    size="medium"
                                    color="error"
                                    margin="dense"
                                    sx={{ mb: 2 }}
                                />
                                <div>
                                    On Going Event?
                                    <Switch
                                        checked={eventRecord.IsOnGoing}
                                        inputProps={{ 'aria-label': 'controlled' }}
                                        name='IsOnGoing'
                                        color="error"
                                        readOnly
                                    />
                                </div>

                                <Button sx={{ mt: 1 }} id={eventRecord._id} variant="contained" size="large"
                                    color="error" fullWidth onClick={onClickView}>View</Button>

                            </FormControl>
                        </Box>
                    </Item>
                ))}
            </Stack>

            <Modal
                open={modal}
                onClose={handleCloseModal}
                aria-labelledby="parent-modal-title"
                aria-describedby="parent-modal-description"
            >
                <Box sx={{ ...style }}>
                    <EventDetail event={selectedEvent} participants={allParticipants} criteria={allCriteria} judges={allJudge} />

                    <Button variant="outlined" color="error" fullWidth onClick={handleCloseModal} sx={{ mt: 3 }}>
                        Close
                    </Button>
                </Box>
            </Modal>
        </>
    )
}


export default Judge