import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'react-toastify'
import { format } from "date-fns";

import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button, Paper, Box, Switch, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';

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
    width: '80%',
    height: '80%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    overflow: 'auto',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
};

function EventDetail({ event, participants, criteria, judges }) {
    const [selectedEvent, setSelectedEvent] = useState(event);
    const [allParticipants, setAllParticipants] = useState(participants);
    const [allCriteria, setAllCriteria] = useState(criteria);
    const [participantList, setParticipantList] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState([]);
    const [score, setScore] = useState([])
    const [open, setOpen] = useState(false);

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
        }
    }, [])

    useEffect(() => {
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

        let tempParticipantList = []
        ParticipantsWithName.forEach(participant => {
            tempParticipantList.push(participant.name)
        })
        console.log(tempParticipantList)
        setParticipantList(tempParticipantList)
        //@ PARTICIPANT WITH CRITERIA AND SCORE
        const criteriaWithScore = CriteriaWithName.map(criteria => {
            return { ...criteria, score: '' };
        });
        let participantList = ParticipantsWithName.map(participant => {
            return { ...participant, criteria: criteriaWithScore, total: '', };
        });

        setScore(participantList);
    }, [selectedEvent])

    function SimpleDialog(props) {
        const { onClose, selectedValue, open } = props;

        const handleClose = () => {
            onClose(selectedValue);
        };

        const handleListItemClick = (value) => {
            onClose(value);
            console.log(value);
        };

        return (
            <Dialog onClose={handleClose} open={open}>
                <DialogTitle>List of Participants</DialogTitle>
                <List sx={{ pt: 0 }}>
                    {participantList.map((participant) => (
                        <ListItem button onClick={() => handleListItemClick(participant)} key={participant} id={participant._id}>
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                                    <PersonIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={participant} />
                        </ListItem>
                    ))}
                </List>
            </Dialog>
        );
    }

    SimpleDialog.propTypes = {
        onClose: PropTypes.func.isRequired,
        open: PropTypes.bool.isRequired,
        selectedValue: PropTypes.string.isRequired,
    };
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
                    return { ...element, score: TemporaryScore };
                }
                else {
                    if (element.score) tempTotal += (parseInt(element.score) * element.percent / 100)
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
        }
    }
    //@ONSUBMIT FUNCTIONS
    const onSubmitScore = (event) => {
        event.preventDefault()
        let URL = 'http://localhost:5000/api/judge/event/' + selectedEvent._id
        if (!selectedEvent._id) {
            return toast.error('You have not selected any event');
        }
        //Validating Score
        let _hasError = false;
        score.forEach(participant => {
            //Check each score if input is 70-100
            participant.criteria.forEach(scoreRecord => {
                if (scoreRecord.score < 70 || scoreRecord.score > 100) {
                    _hasError = true;
                }
            })
        })

        //If it has error
        if (_hasError) {
            toast.error('You can only input score 70-100.');
            console.log('has error');
        }
        //If all input is valid
        else {
            score.forEach(participant => {
                participant.criteria.forEach(scoreRecord => {
                    axios.put(
                        `${process.env.REACT_APP_BACKEND_API}judge/event/${selectedEvent._id}`,
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
                })
            })

            console.log('Score Saved')
            toast.success('Your scores have been saved.');
        }
    }

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (value) => {
        setOpen(false);
        console.log(value)
        setSelectedParticipant(value);
    };

    const formatDateAndTime = (value) => {
        const _date = Date.parse(value);
        return format(_date, "MMMM d, yyyy - h:mma");
    };

    return (
        <>
            {/* <Box 
            sx={{ ...style }}
            > */}
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
                    }} fullWidth margin="dense" color="error"
                />

                <TextField
                    id="outlined-read-only-input"
                    label="Description"
                    defaultValue={selectedEvent.description}
                    InputProps={{
                        readOnly: true,
                    }} fullWidth margin="dense" color="error"
                />

                <TextField
                    id="outlined-read-only-input"
                    label="Venue"
                    defaultValue={selectedEvent.venue}
                    InputProps={{
                        readOnly: true,
                    }} fullWidth margin="dense" color="error"
                />

                <TextField
                    id="outlined-read-only-input"
                    label="Date and Time"
                    defaultValue={formatDateAndTime(selectedEvent.dateTime)}
                    InputProps={{
                        readOnly: true,
                    }} fullWidth margin="dense" color="error"
                />
                <div>
                    On Going Event?
                    <Switch
                        checked={selectedEvent.IsOnGoing}
                        inputProps={{ 'aria-label': 'controlled' }}
                        name='IsOnGoing'
                        readOnly
                        color="error"
                    />
                </div>
            </section>

            <section>
                <SimpleDialog
                    selectedValue={selectedParticipant}
                    open={open}
                    onClose={handleClose}
                />

                {/* <Button variant="outlined" onClick={handleClickOpen}>
                        Select a Participant
                    </Button>
                    <br />
                    <Typography variant="subtitle1" component="div">
                        Selected: {selectedParticipant}
                    </Typography> */}

                <form onSubmit={onSubmitScore}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left">Participant Name</TableCell>
                                    <TableCell align="left">Criteria</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {score.map((row) => (
                                    <TableRow
                                        key={row._id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell align="left">{row.name}</TableCell>
                                        {row.criteria.map((criteria) => (
                                            <TableCell key={criteria._id} align="left">
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
                                                    color="error"
                                                />
                                            </TableCell>
                                        ))}

                                        <TableCell align="left">
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
                                                color="error"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Button type='submit' variant="contained" color="success" disabled={!selectedEvent.IsOnGoing} fullWidth sx={{ mt: 3 }}>
                        Save Score
                    </Button>
                </form>
            </section>
            {/* </Box> */}
        </>
    )
}


export default EventDetail