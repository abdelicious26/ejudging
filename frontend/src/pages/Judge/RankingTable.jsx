import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'react-toastify'

import { styled } from '@mui/material/styles';
import { Table, TableBody, TableContainer, TableHead, TableRow, TextField, Button, Paper, Box } from '@mui/material';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';

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
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

//MAIN FUNCTION
function RankingTable({ event, participants, criteria, judges }) {
    //@VARIABLES
    const [selectedEvent, setSelectedEvent] = useState(event);
    const [allParticipants, setAllParticipants] = useState(participants);
    const [allCriteria, setAllCriteria] = useState(criteria);
    const [eventParticipant, setEventParticipant] = useState([]);
    const [myPreviousScore, setMyPreviousScore] = useState([]);
    const [myScore, setMyScore] = useState([]);
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    let token;

    //@USEEFFECT
    useEffect(() => {
        if (!user) {
            navigate('/login')
        }
        else if (user && user.recordType !== 'judge') {
            navigate('/')
        }
        else {
            token = user.token;
        }
    }, [])
    useEffect(() => {
        //@ GET CRITERIA WITH NAME
        let CriteriaWithName = []
        selectedEvent.criteria.forEach(response => {
            let found = allCriteria.find(element => element._id === response.criteriaId);
            found.orderNumber = response.orderNumber;
            CriteriaWithName.push(found)
        });
        //@ GET PARTICIPANTS WITH NAME
        let ParticipantsWithName = []
        selectedEvent.participant.forEach(response => {
            let found = allParticipants.find(element => element._id === response.participantId);
            found.rank = '';
            found.orderNumber = response.orderNumber;
            ParticipantsWithName.push(found);
        });
        setEventParticipant(ParticipantsWithName);
        CriteriaWithName = CriteriaWithName.map(response => {
            return { ...response, participants: ParticipantsWithName };
        })
        setMyScore(CriteriaWithName);
        //@ GET MY PREVIOUS SCORE
        axios.get(
            `${process.env.REACT_APP_BACKEND_API}judge/event/score/${selectedEvent._id}`,
            { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                if (!response) {
                    setMyPreviousScore("No Previous Score Records");
                }
                else {
                    CriteriaWithName = CriteriaWithName.map(_criteria => {
                        let ParticipantsScore = _criteria.participants.map(_participant => {
                            const _myPreviousScore = response.data.find(element => element.criteria === _criteria._id && element.participant === _participant._id);
                            if (_myPreviousScore)
                                return { ..._participant, rank: _myPreviousScore.score === 0 ? '' : _myPreviousScore.score };
                            else
                                return _participant;
                        })
                        return { ..._criteria, participants: ParticipantsScore };

                    })
                    setMyScore(CriteriaWithName);
                }
            })
    }, [selectedEvent])

    //@ONSUBMIT FUNCTIONS
    const onSubmitScore = (event) => {
        event.preventDefault();
        if (!selectedEvent._id) {
            return toast.error('You have not selected any event');
        }
        //Validating Score
        let _hasError = false;

        //If it has error
        if (_hasError) {
            toast.error('You can only input score 70-100.');
        }
        //If all input is valid
        else {
            myScore.forEach(_criteria => {
                _criteria.participants.forEach(_participant => {
                    axios.put(
                        `${process.env.REACT_APP_BACKEND_API}judge/event/${selectedEvent._id}`,
                        {
                            criteria: _criteria._id,
                            participant: _participant._id,
                            score: _participant.rank !== '' ? _participant.rank : '0'
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
    //@ONCHANGE FUNCTIONS
    const onChangeScore = (event) => {
        console.log(eventParticipant.length)
        let TemporaryScore = event.target.value
        if (TemporaryScore === '') TemporaryScore = ''
        else if (parseInt(TemporaryScore) < 1) TemporaryScore = 1
        else if (parseInt(TemporaryScore) > eventParticipant.length) TemporaryScore = eventParticipant.length;
        else TemporaryScore = parseInt(TemporaryScore)


        console.log(TemporaryScore)
        //@Check if Event is On Going
        if (selectedEvent.IsOnGoing) {
            const tempCriteria = myScore.find(_criteria => _criteria._id === event.target.id)
            const tempScore = tempCriteria.participants.map(_participant => {
                if (_participant._id === event.target.name) {
                    return { ..._participant, rank: TemporaryScore };
                }
                else {
                    return _participant
                }
            });
            tempCriteria.participants = tempScore

            let tempScoreList = myScore.map(scoreRecord => {
                if (scoreRecord._id === event.target.id) return { ...scoreRecord, participants: tempScore }
                return scoreRecord
            }
            )
            console.log('tempScoreList', tempScoreList)
            setMyScore(tempScoreList)
        }
    }

    //RETURN UI
    return (
        <div>
            <form onSubmit={onSubmitScore}>
                {myScore.map(criteria => (
                    <Box sx={{ mb: 2 }}>
                        <h4>Category no. {criteria.orderNumber} : {criteria.name}</h4>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                <TableHead>
                                    <StyledTableRow>
                                        <StyledTableCell align="left">Participant Name</StyledTableCell>
                                        <StyledTableCell align="left">Rank</StyledTableCell>
                                    </StyledTableRow>
                                </TableHead>
                                <TableBody>

                                    {criteria.participants.map(participant => (
                                        <>
                                            <StyledTableRow>
                                                <StyledTableCell align="left">
                                                    <TextField
                                                        name={participant}
                                                        label={'Participant No. ' + participant.orderNumber}
                                                        value={participant.name}
                                                        readOnly
                                                        variant="outlined"
                                                        color="error"
                                                    />
                                                </StyledTableCell>
                                                <StyledTableCell align="left">
                                                    <TextField
                                                        id={criteria._id}
                                                        name={participant._id}
                                                        key={participant._id}
                                                        label='Rank'
                                                        value={participant.rank}
                                                        onChange={onChangeScore}
                                                        type="number"
                                                        inputProps={{ inputMode: 'numeric', pattern: '[1-100]*' }}
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                        variant="outlined"
                                                        disabled={!selectedEvent.IsOnGoing}
                                                        color="error"
                                                        sx={{ mr: 1 }}
                                                        margin='dense'
                                                    />
                                                </StyledTableCell>
                                            </StyledTableRow>
                                        </>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                ))}

                <Button type='submit' variant="contained" color="success" disabled={!selectedEvent.IsOnGoing} fullWidth sx={{ mt: 3 }}>
                    Save Score
                </Button>
            </form>
        </div>
    )
}

export default RankingTable