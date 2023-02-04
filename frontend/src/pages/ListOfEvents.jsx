import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { toast } from 'react-toastify'
import Modal from '@mui/material/Modal';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import Button from '@mui/material/Button';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Print from '@mui/icons-material/Print';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PreviewIcon from '@mui/icons-material/Preview';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Divider from '@mui/material/Divider';
import { format } from "date-fns";
import ReactToPrint from "react-to-print";
import AddIcon from '@mui/icons-material/Add';

import CreateEvent from './MaintenanceEvent/CreateEvent';
import EditEvent from './MaintenanceEvent/EditEvent';
import EventResultRating from './EventResultRating';
import EventResultRanking from './EventResultRanking';
import EventResultRatingRanking from './EventResultRatingRanking';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#1769aa',
        color: theme.palette.common.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        fontWeight: 'bold',
    },
}));

const StyledTableCellPerJudge = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#2196f3',
        color: theme.palette.common.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableCellView = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#1769aa',
        color: theme.palette.common.white,
        fontWeight: 'bold',
        fontSize: 16,
        size: '50%'
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: '#c8e4fb',
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

const style = {
    position: 'fixed',
    top: '5%',
    left: '5%',
    // transform: 'translate(-50%, -50%)',
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

const resultModalStyle = {
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

const modalStyle = {
    position: 'absolute',
    top: '10%',
    left: '10%',
    overflow: 'auto',
    height: '100%',
    display: 'block'
};

function ListOfEvents() {
    const [allEvents, setAllEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState({});
    const [allParticipants, setAllParticipants] = useState([]);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [allJudge, setAllJudge] = useState([]);
    const [selectedJudge, setSelectedJudge] = useState([]);
    const [allCriteria, setAllCriteria] = useState([]);
    const [allEventScores, setAllEventScores] = useState([]);
    const [selectedCriteria, setSelectedCriteria] = useState([]);
    const [viewModal, setViewModal] = useState(false);
    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [resultModal, setResultModal] = useState(false);
    const [rankPerJudge, setRankPerJudge] = useState([]);
    const [eventResult, setEventResult] = useState([]);

    const componentRef = useRef();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
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
                `${process.env.REACT_APP_BACKEND_API}events/`,
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
            URL = `${process.env.REACT_APP_BACKEND_API}events/detail/result/` + selectedEvent._id
            axios.get(
                `${process.env.REACT_APP_BACKEND_API}events/detail/result/${selectedEvent._id}`,
                { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                    if (!response) return
                    AllEventScore = response.data
                    setAllEventScores(AllEventScore);
                    AllEventScore = AllEventScore.map(result => {
                        const found = allCriteria.find(element => element._id === result.criteria);
                        const percent = selectedEvent.criteria.find(element => element.criteriaId === found._id);
                        return { ...result, criteriaName: found.name, percent: percent.percent }
                    })
                    AllEventScore = AllEventScore.map(result => {
                        const found = allJudge.find(element => element._id === result.judge);
                        return { ...result, judgeName: `${found.firstName} ${found.lastName}` }
                    })

                    //SET RANK PER JUDGE -----------------------------
                    let JudgeWithRanking = []
                    JudgeWithName.forEach(judge => {
                        let judgeRecord = []
                        AllEventScore.forEach(data => {
                            if (judge._id === data.judge) judgeRecord.push(data)
                        })

                        let tempjudgeRecord = judge
                        tempjudgeRecord.score = judgeRecord
                        JudgeWithRanking.push(tempjudgeRecord)
                    })

                    JudgeWithRanking = JudgeWithRanking.map(judge => {
                        let scorePerParticipant = []
                        //Get Scores Per Participants
                        ParticipantsWithName.forEach(participant => {
                            let scoreObject = {}
                            let scoreFilter = judge.score.filter(judgescore => {
                                return judgescore.participant === participant._id
                            })
                            let tempTotal = 0
                            scoreFilter.forEach(data => {
                                tempTotal += data.score * data.percent / 100
                            })

                            scoreObject.participant = participant;
                            scoreObject.totalScore = tempTotal;
                            scorePerParticipant.push(scoreObject);
                        })

                        //Rank Participants based on Score
                        let rankCount = 1;
                        let judgeScores = scorePerParticipant.map(score => {
                            return score.totalScore;
                        })
                        judgeScores = [...new Set(judgeScores)];
                        judgeScores.sort(function (a, b) { return b - a });
                        let rankPerParticipant = [];
                        judgeScores.forEach(score => {
                            let participants = scorePerParticipant.filter(element => element.totalScore === score);
                            let rank;
                            if (participants.length == 1) {
                                rank = rankCount;
                                rankCount += participants.length;
                            }
                            else if (participants.length > 1) {
                                let tempRankCountOld = rankCount;
                                rankCount += participants.length;
                                rank = (rankCount - 1 + tempRankCountOld) / participants.length;
                            }
                            participants.forEach(participant => {
                                let participantRank = {};
                                participantRank.participant = participant.participant;
                                participantRank.participantId = participant.participant._id;
                                participantRank.rank = parseFloat(rank.toFixed(2));
                                participantRank.score = score;
                                rankPerParticipant.push(participantRank);
                            })
                        })

                        return { ...judge, scorePerParticipant: scorePerParticipant, participantsRank: rankPerParticipant };
                    })
                    setRankPerJudge(JudgeWithRanking);
                    console.log('JudgeWithRanking', JudgeWithRanking)
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
        const found = allEvents.find(({ _id }) => _id === event.target.id);
        if (found) {
            setViewModal(true)
            setSelectedEvent(found)
        }
    }

    const onClickEdit = (event) => {
        setEditModal(true)
        const found = allEvents.find(element => element._id === event.target.id);
        setSelectedEvent(found)
    }

    const onClickDelete = (event) => {
        let decision = window.confirm("You are about to delete the event. Are you sure you want to proceed? This action cannot be undone.");
        if (decision) {
            axios.delete(
                `${process.env.REACT_APP_BACKEND_API}events/${event.target.id}`,
                null,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        'Access-Control-Allow-Origin': '*',
                    }
                })
                .then(() => {
                    toast.success('You have deleted the Event.');
                    const _tempAllEvents = allEvents.filter(_events => {
                        return _events._id !== event.target.id
                    })
                    console.log('_tempAllEvents', _tempAllEvents)
                    setAllEvents(_tempAllEvents);

                })
                .catch((error) => {
                    toast.error('There was an error deleting the Event.');
                    console.log(error);
                })
        }
    }

    const onClickUpdateStatus = (event => {
        if (!selectedEvent._id) {
            return toast.error('Sorry. There was an error on your request.');
        }
        let _tempCurrentStatus = !selectedEvent.IsOnGoing;
        axios.put(
            `${process.env.REACT_APP_BACKEND_API}events/detail/${selectedEvent._id}`,
            {
                name: selectedEvent.name,
                description: selectedEvent.description,
                venue: selectedEvent.venue,
                dateTime: selectedEvent.dateTime,
                isActive: selectedEvent.isActive,
                IsOnGoing: _tempCurrentStatus
            },
            { headers: { "Authorization": `Bearer ${token}` } })
            .then((response) => {
                if (_tempCurrentStatus)
                    toast.success('Activated the Event');
                else
                    toast.error('Deactivated the Event');
                setSelectedEvent((prevState) => ({
                    ...prevState,
                    ['IsOnGoing']: _tempCurrentStatus,
                }))

                let _allEvents = allEvents.map(_event => {
                    if (_event._id === selectedEvent._id)
                        return { ..._event, IsOnGoing: _tempCurrentStatus }
                    else
                        return _event
                })
                setAllEvents(_allEvents);
            })
            .catch((error) => {
                toast.error(error.response.data);
            })
    })

    const formatDateAndTime = (value) => {
        try {
            const _date = Date.parse(value);
            return format(_date, "MMMM d, yyyy - h:mma");;
        }
        catch (e) {
            return value;
        }
    };


    const onClickCloseAddModal = () => {
        let decision = window.confirm("You are about to close this page. Are you sure you want to proceed? Any unsaved details will not be saved.");
        if (decision)
            setAddModal(false);
    }

    const onClickCloseEditModal = () => {
        let decision = window.confirm("You are about to close this page. Are you sure you want to proceed? Any unsaved details will not be saved.");
        if (decision)
            setEditModal(false);
    }

    //@MODAL OF RESULT
    const showEventResultScore = () => {
        if (selectedEvent.scoringType === 'Rating') {
            return <div>
                <EventResultRating
                    selectedEventFromParent={selectedEvent}
                    eventScoresFromParent={allEventScores}
                    allEventsFromParent={allEvents}
                    allJudgeFromParent={allJudge}
                    allCriteriaFromParent={allCriteria}
                    allParticipantsFromParent={allParticipants}
                />
            </div>
        }

        else if (selectedEvent.scoringType === 'Ranking') {
            return <div>
                <EventResultRanking
                    selectedEventFromParent={selectedEvent}
                    eventScoresFromParent={allEventScores}
                    allJudgeFromParent={allJudge}
                    allCriteriaFromParent={allCriteria}
                    allParticipantsFromParent={allParticipants}
                />
            </div>
        }
        else if (selectedEvent.scoringType === 'Rating-Ranking') {
            return <div>
                <EventResultRatingRanking
                    selectedEventFromParent={selectedEvent}
                    eventScoresFromParent={allEventScores}
                    allJudgeFromParent={allJudge}
                    allCriteriaFromParent={allCriteria}
                    allParticipantsFromParent={allParticipants}
                />
            </div>
        }
    }

    const showEventResult = () => {
        return (
            <>
                <Modal
                    open={resultModal}
                    onClose={() => setResultModal(false)}
                    aria-labelledby="child-modal-title"
                    aria-describedby="child-modal-description"
                >
                    <div>
                        <Box sx={{ ...resultModalStyle, width: '85%', height: '85%' }}>
                            <Box
                                m={1}
                                //margin
                                display="flex"
                                justifyContent="flex-end"
                                alignItems="flex-end"
                            >
                                <IconButton color="error" aria-label="close modal" onClick={() => setResultModal(false)}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            <Box id='printablediv' ref={componentRef} className='printable'>
                                <Box sx={{ border: 0, borderRadius: '8px', mb: 6 }}>
                                    <p id="child-modal-title"><b>Event Name: </b>{selectedEvent.name}</p>
                                    <p id="child-modal-title"><b>Description: </b>{selectedEvent.description}</p>
                                    <p id="child-modal-title"><b>Venue: </b>{selectedEvent.venue}</p>
                                    <p id="child-modal-title"><b>Scoring Type: </b>{selectedEvent.scoringType}</p>
                                    <p id="child-modal-title"><b>Date and Time: </b> {formatDateAndTime(selectedEvent.dateTime)}</p>

                                    {/* <TableContainer component={Paper} sx={{ my: 1 }}>
                                        <Table sx={{ minWidth: 650 }} aria-label="customized table">
                                            <TableHead>
                                                <TableRow>
                                                    <StyledTableCell align="left">Participant Name</StyledTableCell>
                                                    <StyledTableCell align="right">Total Points from Rank</StyledTableCell>
                                                    <StyledTableCell align="right">Final Rank</StyledTableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {eventResult.map((row) => (
                                                    <StyledTableRow key={row.name}>
                                                        <StyledTableCell component="th" scope="row" align="left">
                                                            {row.name}
                                                        </StyledTableCell>
                                                        <StyledTableCell align="right">{row.sumOfRank}</StyledTableCell>
                                                        <StyledTableCell align="right">{row.finalRank}</StyledTableCell>
                                                    </StyledTableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer> */}
                                    {showEventResultScore()}
                                </Box>

                                {selectedEvent.scoringType !== 'Ranking' ? (
                                    <>
                                        <Divider />
                                        <h3>Score per Judge:</h3>

                                        {rankPerJudge.map((judge) => (
                                            // <h4></h4>
                                            <div key={judge._id}>
                                                {/* <h4> Judge: {judge.firstName} {judge.lastName}</h4> */}

                                                <p id="child-modal-title">Judge Name: <b>{judge.firstName} {judge.lastName}</b></p>
                                                < TableContainer component={Paper} sx={{ mb: 3 }}>
                                                    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                                        <TableHead>
                                                            <StyledTableRow>
                                                                <StyledTableCellPerJudge>Participant Name</StyledTableCellPerJudge>
                                                                <StyledTableCellPerJudge align="right">Total Score</StyledTableCellPerJudge>
                                                                <StyledTableCellPerJudge align="right">Rank</StyledTableCellPerJudge>
                                                            </StyledTableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {judge.participantsRank.map((participant) => (
                                                                <StyledTableRow
                                                                    key={participant.participant._id}
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >
                                                                    <StyledTableCellPerJudge align="left">{participant.participant.name}</StyledTableCellPerJudge>
                                                                    <StyledTableCellPerJudge align="right">{participant.score}</StyledTableCellPerJudge>
                                                                    <StyledTableCellPerJudge align="right">{participant.rank}</StyledTableCellPerJudge>
                                                                </StyledTableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                                <Divider />
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <></>
                                )}
                                <Box sx={{ mt: 0 }}>
                                    <p>Signature:</p>
                                    {selectedJudge.map((judge) => (
                                        // <h4></h4>
                                        <Box key={judge._id} sx={{ mt: 5 }}>
                                            <p class='signatureName'><b>{judge.firstName} {judge.lastName}</b></p>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            <Box sx={{ mt: 5 }}>
                                <Button onClick={() => setResultModal(false)} variant='outlined' color='error' sx={{ mr: 1 }}>Close Result</Button>
                                <ReactToPrint
                                    trigger={() => <Button startIcon={<Print />} variant='contained' color='success'>Print Result</Button>}
                                    content={() => componentRef.current}
                                />
                            </Box>

                        </Box>
                    </div>
                </Modal>
            </>
        )
    }

    //@MODAL OF EVENT DETAIL
    const ShowEventDetail = () => {
        return (
            <>
                <Modal
                    open={viewModal}
                    onClose={() => setViewModal(false)}
                    aria-labelledby="parent-modal-title"
                    aria-describedby="parent-modal-description"
                    className={modalStyle}
                >

                    <Box sx={{ ...style }}>
                        <Box
                            m={1}
                            //margin
                            display="flex"
                            justifyContent="flex-end"
                            alignItems="flex-end"
                        >
                            <IconButton color="error" aria-label="close modal" onClick={() => setViewModal(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
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
                                label="Scoring Type"
                                defaultValue={selectedEvent.scoringType}
                                InputProps={{
                                    readOnly: true,
                                }} fullWidth margin="dense"
                            />
                            <TextField
                                id="outlined-read-only-input"
                                label="Date and Time"
                                defaultValue={formatDateAndTime(selectedEvent.dateTime)}
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
                                />
                            </div>

                            {selectedEvent.IsOnGoing ? (
                                <Button onClick={onClickUpdateStatus} variant="contained" color="error" sx={{ mr: 1 }}>
                                    Deactivate The Event
                                </Button>
                            ) : (
                                <Button onClick={onClickUpdateStatus} variant="contained" color="success" sx={{ mr: 1 }}>
                                    Activate The Event
                                </Button>
                            )}
                            <Button onClick={() => { setResultModal(true) }} variant="outlined" color="primary" startIcon={<PreviewIcon />}>
                                View Result
                            </Button>
                        </section>

                        <section>
                            <Box sx={{ mt: 1, border: 1, borderColor: 'gray.500', borderRadius: '8px' }}>
                                <Box sx={{ m: 1 }}>
                                    <h1>
                                        Criteria:
                                    </h1>
                                </Box>

                                <TableContainer component={Paper} sx={{ mb: 3 }}>
                                    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                        <TableHead>
                                            {selectedEvent.scoringType !== "Ranking" ?
                                                (
                                                    <StyledTableRow>

                                                        <StyledTableCellView align="left" sx={{ fontSize: 18, fontWeight: 'bold' }}>Criteria Name</StyledTableCellView>
                                                        <StyledTableCellView align="left" sx={{ fontSize: 18, fontWeight: 'bold' }}>Description</StyledTableCellView>

                                                        <StyledTableCellView align="left" sx={{ fontSize: 18, fontWeight: 'bold' }}>Percent(%)</StyledTableCellView>
                                                    </StyledTableRow>
                                                ) : (
                                                    <StyledTableRow>
                                                        <StyledTableCellView align="left" sx={{ fontSize: 18, fontWeight: 'bold' }}>Criteria Name</StyledTableCellView>
                                                        <StyledTableCellView align="left" sx={{ fontSize: 18, fontWeight: 'bold' }}>Description</StyledTableCellView>
                                                    </StyledTableRow>
                                                )
                                            }
                                        </TableHead>
                                        {selectedEvent.scoringType !== "Ranking" ?
                                            (
                                                <TableBody>
                                                    {selectedCriteria.map((row) => (
                                                        <StyledTableRow
                                                            key={row._id}
                                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                        >
                                                            <StyledTableCellView align="left">{row.name}</StyledTableCellView>
                                                            <StyledTableCellView align="left">{row.description}</StyledTableCellView>
                                                            <StyledTableCellView align="left">{row.percent}</StyledTableCellView>
                                                        </StyledTableRow>

                                                    ))}
                                                </TableBody>
                                            ) : (
                                                <TableBody>
                                                    {selectedCriteria.map((row) => (
                                                        <StyledTableRow
                                                            key={row._id}
                                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                        >
                                                            <StyledTableCellView align="left">{row.name}</StyledTableCellView>
                                                            <StyledTableCellView align="left">{row.description}</StyledTableCellView>
                                                        </StyledTableRow>

                                                    ))}
                                                </TableBody>
                                            )
                                        }
                                    </Table>
                                </TableContainer>
                            </Box>
                        </section>

                        <section>
                            <Box sx={{ mt: 1, border: 1, borderColor: 'gray.500', borderRadius: '8px' }}>
                                <Box sx={{ m: 1 }}>
                                    <h1>
                                        Judges:
                                    </h1>
                                </Box>
                                <TableContainer component={Paper} sx={{ mb: 3 }}>
                                    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                        <TableHead>
                                            <StyledTableRow>
                                                <StyledTableCellView align="left" sx={{ fontSize: 18, fontWeight: 'bold' }}>First Name</StyledTableCellView>
                                                <StyledTableCellView align="left" sx={{ fontSize: 18, fontWeight: 'bold' }}>Last Name</StyledTableCellView>
                                            </StyledTableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedJudge.map((row) => (
                                                <StyledTableRow
                                                    key={row._id}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <StyledTableCellView align="left">{row.firstName}</StyledTableCellView>
                                                    <StyledTableCellView align="left">{row.lastName}</StyledTableCellView>
                                                </StyledTableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </section>

                        <section>
                            <Box sx={{ mt: 1, border: 1, borderColor: 'gray.500', borderRadius: '8px' }}>
                                <Box sx={{ m: 1 }}>
                                    <h1>
                                        Participants:
                                    </h1>
                                </Box>
                                <TableContainer component={Paper} sx={{ mb: 3 }}>
                                    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                        <TableHead>
                                            <StyledTableRow>
                                                <StyledTableCellView align="left" sx={{ fontSize: 18, fontWeight: 'bold' }}>Participant Name</StyledTableCellView>
                                                <StyledTableCellView align="left" sx={{ fontSize: 18, fontWeight: 'bold' }}>Description</StyledTableCellView>
                                            </StyledTableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedParticipants.map((row) => (
                                                <StyledTableRow
                                                    key={row._id}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <StyledTableCellView align="left">{row.name}</StyledTableCellView>
                                                    <StyledTableCellView align="left">{row.description}</StyledTableCellView>
                                                </StyledTableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </section>
                        <Button onClick={() => setViewModal(false)} sx={{ mt: 2 }} variant="outlined" color="error">
                            Close
                        </Button>
                        {showEventResult()}
                    </Box>
                </Modal>
            </>
        )
    }

    //@MODAL OF CREATE EVENT
    const ShowCreateEvent = () => {
        return (
            <>
                <Modal
                    open={addModal}
                    onClose={onClickCloseAddModal}
                    aria-labelledby="parent-modal-title"
                    aria-describedby="parent-modal-description"
                    className={modalStyle}
                >
                    <Box sx={{ ...style, border: '3px solid #1769aa', }}>
                        <Box
                            m={1}
                            //margin
                            display="flex"
                            justifyContent="flex-end"
                            alignItems="flex-end"
                        >
                            <IconButton color="error" aria-label="close modal" onClick={onClickCloseAddModal}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <CreateEvent />
                    </Box>
                </Modal>
            </>
        )
    }


    //@MODAL OF CREATE EVENT
    const ShowEditEvent = () => {
        return (
            <>
                <Modal
                    open={editModal}
                    onClose={onClickCloseEditModal}
                    aria-labelledby="parent-modal-title"
                    aria-describedby="parent-modal-description"
                    className={modalStyle}
                >
                    <Box sx={{ ...style, border: '3px solid #1769aa', }}>
                        <Box
                            m={1}
                            //margin
                            display="flex"
                            justifyContent="flex-end"
                            alignItems="flex-end"
                        >
                            <IconButton color="error" aria-label="close modal" onClick={onClickCloseEditModal}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <EditEvent selectedEvent={selectedEvent} />
                    </Box>
                </Modal>
            </>
        )
    }

    //@RETURN UI
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Item>
                        <section className='heading'>
                            <h1>
                                List of Events
                            </h1>
                            <Grid container justify="flex-end">
                                <Button variant="contained" color="success" size="large" onClick={() => setAddModal(true)} startIcon={<AddIcon />}>
                                    Create New Event
                                </Button>
                            </Grid>
                        </section>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                <TableHead>
                                    <StyledTableRow>
                                        <StyledTableCell align="left" sx={{ fontSize: 18, fontWeight: 'bold' }} >Event Name</StyledTableCell>
                                        <StyledTableCell align="left" sx={{ fontSize: 18, fontWeight: 'bold' }}>Description</StyledTableCell>
                                        <StyledTableCell align="left" sx={{ fontSize: 18, fontWeight: 'bold' }}>Venue</StyledTableCell>
                                        <StyledTableCell align="left" sx={{ fontSize: 18, fontWeight: 'bold' }}>Scoring Type</StyledTableCell>
                                        <StyledTableCell align="left" sx={{ fontSize: 18, fontWeight: 'bold' }}>Date & Time</StyledTableCell>
                                        <StyledTableCell align="left" sx={{ fontSize: 18, fontWeight: 'bold' }}>Active?</StyledTableCell>
                                        <StyledTableCell align="left" sx={{ fontSize: 18, fontWeight: 'bold' }}>Actions</StyledTableCell>
                                    </StyledTableRow>
                                </TableHead>
                                <TableBody>
                                    {allEvents.map((row) => (
                                        <StyledTableRow
                                            key={row._id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <StyledTableCell align="left">{row.name}</StyledTableCell>
                                            <StyledTableCell align="left">{row.description}</StyledTableCell>
                                            <StyledTableCell align="left">{row.venue}</StyledTableCell>
                                            <StyledTableCell align="left">{formatDateAndTime(row.scoringType)}</StyledTableCell>
                                            <StyledTableCell align="left">{formatDateAndTime(row.dateTime)}</StyledTableCell>
                                            <StyledTableCell align="left">
                                                <input
                                                    type='checkbox'
                                                    className='form-control'
                                                    id='isOnGoing'
                                                    name='isOnGoing'
                                                    checked={row.IsOnGoing}
                                                    readOnly />
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                {/* <Button id={row._id} name={row.name} variant="contained" onClick={(event) => { handleClick(event, cellValues); }} color="primary" sx={{ mr: .5, mt: .5 }}>
                                                    <VisibilityIcon />
                                                </Button> */}
                                                <Button id={row._id} name={row.name} variant="contained" onClick={onClickView} color="primary" sx={{ mr: .5, mt: .5 }}>
                                                    <VisibilityIcon />
                                                </Button>
                                                <Button id={row._id} name={row.name} variant="contained" onClick={onClickEdit} color="success" sx={{ mr: .5, mt: .5 }}>
                                                    <EditIcon />
                                                </Button>
                                                <Button id={row._id} name={row.name} variant="contained" onClick={onClickDelete} color="error" sx={{ mr: .5, mt: .5 }}>
                                                    <DeleteIcon />
                                                </Button>
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Item>
                </Grid>
            </Grid>


            {ShowEventDetail()}
            {ShowCreateEvent()}
            {ShowEditEvent()}
        </>
    )
}


export default ListOfEvents