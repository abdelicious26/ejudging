import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'react-toastify'

import { styled } from '@mui/material/styles';
import { Table, TableBody, TableContainer, TableHead, TableRow, TextField, Button, Paper } from '@mui/material';
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
function RatingTable({ event, participants, criteria, judges }) {
    //@VARIABLES
    const [selectedEvent, setSelectedEvent] = useState(event);
    const [allParticipants, setAllParticipants] = useState(participants);
    const [allCriteria, setAllCriteria] = useState(criteria);
    const [participantList, setParticipantList] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState([]);
    const [myPreviousScore, setMyPreviousScore] = useState([]);
    const [score, setScore] = useState([]);
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
                                return { ...criteria, score: _tempPreviousScore.score === 0 ? '' : _tempPreviousScore.score };
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
                console.log('score', score)
            })
    }, [selectedEvent])

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
                if ((scoreRecord.score < 70 || scoreRecord.score > 100) && scoreRecord.score !== '') {
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
                            score: scoreRecord.score !== '' ? scoreRecord.score : '0'
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

            console.log('tempParticipant', tempParticipant);
            let tempScoreList = score.map(scoreRecord => {
                if (scoreRecord._id === event.target.id) return tempParticipant
                return scoreRecord
            }
            )
            console.log(tempScoreList);
            setScore(tempScoreList)
        }
    }

    //RETURN UI
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
                                                value={criteria.score}
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

export default RatingTable