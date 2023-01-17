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
import { Table, TableBody, TableContainer, TableHead, TableRow, TextField, Button, Paper, Box, Switch, Typography } from '@mui/material';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { blue } from '@mui/material/colors';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.error.dark,
        color: theme.palette.common.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        fontWeight: 'bold',
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

function EventDetail({ event, participants, criteria, judges }) {
    const [selectedEvent, setSelectedEvent] = useState(event);
    const [allParticipants, setAllParticipants] = useState(participants);
    const [allCriteria, setAllCriteria] = useState(criteria);
    const [participantList, setParticipantList] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState([]);
    const [myPreviousScore, setMyPreviousScore] = useState([]);
    const [score, setScore] = useState([]);
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
        console.log('ParticipantsWithName', ParticipantsWithName);

        let tempParticipantList = []
        ParticipantsWithName.forEach(participant => {
            tempParticipantList.push(participant.name)
        })
        setParticipantList(tempParticipantList)

        //@ PARTICIPANT WITH CRITERIA AND SCORE
        const criteriaWithScore = CriteriaWithName.map(criteria => {
            return { ...criteria, score: '' };
        });
        let participantList = ParticipantsWithName.map(participant => {
            return { ...participant, criteria: criteriaWithScore, total: '', };
        });

        //@ GET MY PREVIOUS SCORE
        axios.get(
            `${process.env.REACT_APP_BACKEND_API}judge/event/score/${selectedEvent._id}`,
            { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                if (!response) {
                    setMyPreviousScore("No Previous Score Records");
                }
                else {
                    let _tempMyScores = response.data;
                    //ASSIGN PREVIOUS SCORES TO TABLE
                    participantList = participantList.map(participant => {
                        let _tempCriteriaWithScore = participant.criteria.map(criteria => {
                            const _tempPreviousScore = _tempMyScores.find(element => element.criteria === criteria._id && element.participant === participant._id);
                            if (_tempPreviousScore)
                                return { ...criteria, score: _tempPreviousScore.score };
                            else
                                return { ...criteria };
                        })
                        return { ...participant, criteria: _tempCriteriaWithScore };
                    })
                    //CALCULATE TOTAL SCORE FROM PREVIOUS SCORES
                    participantList = participantList.map(participant => {
                        let _tempTotal = 0;
                        participant.criteria.forEach(criteriaScore => {
                            if (criteriaScore.score) {
                                _tempTotal += criteriaScore.score * (criteriaScore.percent / 100)
                            }
                        })
                        return { ...participant, total: _tempTotal };
                    })
                }
                let _participantOrderNumber = 1;
                participantList = participantList.map(participant => {
                    return { ...participant, orderNumber: _participantOrderNumber++ };
                })
                setScore(participantList);
                console.log('participantList', participantList);
            })
    }, [selectedEvent])

    function SimpleDialog(props) {
        const { onClose, selectedValue, open } = props;

        const handleClose = () => {
            onClose(selectedValue);
        };

        const handleListItemClick = (value) => {
            onClose(value);
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
            toast.success('Your scores have been saved.');
        }
    }

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (value) => {
        setOpen(false);
        setSelectedParticipant(value);
    };

    const formatDateAndTime = (value) => {
        const _date = Date.parse(value);
        return format(_date, "MMMM d, yyyy - h:mma");
    };

    const showScoringComponent = () => {
        // SHOW SCORING TABLE IF SCORING TYPE IS RATING
        if (selectedEvent.scoringType === 'Rating') {
            return (
                <div>
                    <form onSubmit={onSubmitScore}>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                <TableHead>
                                    <StyledTableRow>
                                        <StyledTableCell align="left">Participant Name</StyledTableCell>
                                        <StyledTableCell align="left">Criteria</StyledTableCell>
                                        <StyledTableCell align="left">Total</StyledTableCell>
                                    </StyledTableRow>
                                </TableHead>

                                <TableBody>
                                    {score.map((row) => (
                                        <StyledTableRow
                                            key={row._id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <StyledTableCell align="left">
                                                <TextField
                                                    name='participantName'
                                                    label={'Participant No.' + row.orderNumber}
                                                    value={row.name}
                                                    readOnly
                                                    variant="outlined"
                                                    color="error"
                                                />
                                            </StyledTableCell>
                                            <StyledTableCell align="left">
                                                {row.criteria.map((criteria) => (
                                                    // <div key={criteria._id}>
                                                    <TextField
                                                        id={row._id}
                                                        name={criteria._id}
                                                        key={criteria._id}
                                                        label={criteria.name + ' - ' + criteria.percent + '%'}
                                                        defaultValue={criteria.score}
                                                        onChange={onChangeScore}
                                                        type="number"
                                                        inputProps={{ inputMode: 'numeric', pattern: '[1-100]*' }}
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                        variant="outlined"
                                                        required
                                                        disabled={!selectedEvent.IsOnGoing}
                                                        color="error"
                                                        sx={{ mr: 1 }}
                                                        margin='dense'
                                                    />
                                                    // </div>
                                                ))}
                                            </StyledTableCell>

                                            <StyledTableCell align="left">
                                                <TextField
                                                    id={row._id}
                                                    name='total'
                                                    label='TOTAL SCORE'
                                                    value={row.total}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    readOnly
                                                    variant="outlined"
                                                    color="error"
                                                />
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Button type='submit' variant="contained" color="success" disabled={!selectedEvent.IsOnGoing} fullWidth sx={{ mt: 3 }}>
                            Save Score
                        </Button>
                    </form>
                </div>
            )
        }
        // SHOW SCORING TABLE IF SCORING TYPE IS RANKING
        else if (selectedEvent.scoringType === 'Ranking') {
            return (
                <div>
                    <form onSubmit={onSubmitScore}>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                <TableHead>
                                    <StyledTableRow>
                                        <StyledTableCell align="left">Participant Name</StyledTableCell>
                                        <StyledTableCell align="left">Criteria</StyledTableCell>
                                        <StyledTableCell align="left">Total</StyledTableCell>
                                    </StyledTableRow>
                                </TableHead>

                                <TableBody>
                                    {score.map((row) => (
                                        <StyledTableRow
                                            key={row._id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <StyledTableCell align="left">
                                                <TextField
                                                    name='participantName'
                                                    label={'Participant No.' + row.orderNumber}
                                                    value={row.name}
                                                    readOnly
                                                    variant="outlined"
                                                    color="error"
                                                />
                                            </StyledTableCell>
                                            <StyledTableCell align="left">
                                                {row.criteria.map((criteria) => (
                                                    // <div key={criteria._id}>
                                                    <TextField
                                                        id={row._id}
                                                        name={criteria._id}
                                                        key={criteria._id}
                                                        label={criteria.name}
                                                        defaultValue={criteria.score}
                                                        onChange={onChangeScore}
                                                        type="number"
                                                        inputProps={{ inputMode: 'numeric', pattern: '[1-100]*' }}
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                        variant="outlined"
                                                        required
                                                        disabled={!selectedEvent.IsOnGoing}
                                                        color="error"
                                                        sx={{ mr: 1 }}
                                                        margin='dense'
                                                    />
                                                    // </div>
                                                ))}
                                            </StyledTableCell>

                                            <StyledTableCell align="left">
                                                <TextField
                                                    id={row._id}
                                                    name='total'
                                                    label='TOTAL SCORE'
                                                    value={row.total}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    readOnly
                                                    variant="outlined"
                                                    color="error"
                                                />
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Button type='submit' variant="contained" color="success" disabled={!selectedEvent.IsOnGoing} fullWidth sx={{ mt: 3 }}>
                            Save Score
                        </Button>
                    </form>
                </div>
            )
        }
        else {
            return (
                <div>
                    <form onSubmit={onSubmitScore}>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                <TableHead>
                                    <StyledTableRow>
                                        <StyledTableCell align="left">Participant Name</StyledTableCell>
                                        <StyledTableCell align="left">Criteria</StyledTableCell>
                                        <StyledTableCell align="left">Total</StyledTableCell>
                                    </StyledTableRow>
                                </TableHead>

                                <TableBody>
                                    {score.map((row) => (
                                        <StyledTableRow
                                            key={row._id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <StyledTableCell align="left">
                                                <TextField
                                                    name='participantName'
                                                    label={'Participant No.' + row.orderNumber}
                                                    value={row.name}
                                                    readOnly
                                                    variant="outlined"
                                                    color="error"
                                                />
                                            </StyledTableCell>
                                            <StyledTableCell align="left">
                                                {row.criteria.map((criteria) => (
                                                    // <div key={criteria._id}>
                                                    <TextField
                                                        id={row._id}
                                                        name={criteria._id}
                                                        key={criteria._id}
                                                        label={criteria.name + ' - ' + criteria.percent + '%'}
                                                        defaultValue={criteria.score}
                                                        onChange={onChangeScore}
                                                        type="number"
                                                        inputProps={{ inputMode: 'numeric', pattern: '[1-100]*' }}
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                        variant="outlined"
                                                        required
                                                        disabled={!selectedEvent.IsOnGoing}
                                                        color="error"
                                                        sx={{ mr: 1 }}
                                                        margin='dense'
                                                    />
                                                    // </div>
                                                ))}
                                            </StyledTableCell>

                                            <StyledTableCell align="left">
                                                <TextField
                                                    id={row._id}
                                                    name='total'
                                                    label='TOTAL SCORE'
                                                    value={row.total}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    readOnly
                                                    variant="outlined"
                                                    color="error"
                                                />
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Button type='submit' variant="contained" color="success" disabled={!selectedEvent.IsOnGoing} fullWidth sx={{ mt: 3 }}>
                            Save Score
                        </Button>
                    </form>
                </div>
            )
        }
    }


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
                    variant='standard'
                />

                <TextField
                    id="outlined-read-only-input"
                    label="Description"
                    defaultValue={selectedEvent.description}
                    InputProps={{
                        readOnly: true,
                    }} fullWidth margin="dense" color="error"
                    variant='standard'
                />

                <TextField
                    id="outlined-read-only-input"
                    label="Venue"
                    defaultValue={selectedEvent.venue}
                    InputProps={{
                        readOnly: true,
                    }} fullWidth margin="dense" color="error"
                    variant='standard'
                />

                <TextField
                    id="outlined-read-only-input"
                    label="Date and Time"
                    defaultValue={formatDateAndTime(selectedEvent.dateTime)}
                    InputProps={{
                        readOnly: true,
                    }} fullWidth margin="dense" color="error"
                    variant='standard'
                />
                <div>
                    Active?
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
                {showScoringComponent()}
            </section>
            {/* </Box> */}
        </>
    )
}


export default EventDetail