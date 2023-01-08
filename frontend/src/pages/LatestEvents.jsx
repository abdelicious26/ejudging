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
import { Divider } from '@mui/material'
import { format } from "date-fns";

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
    const [rankPerJudge, setRankPerJudge] = useState([]);
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
                    AllEventScore = AllEventScore.map(result => {
                        const found = allCriteria.find(element => element._id === result.criteria);
                        const percent = selectedEvent.criteria.find(element => element.criteriaId === found._id);
                        return { ...result, criteriaName: found.name, percent: percent.percent }
                    })
                    AllEventScore = AllEventScore.map(result => {
                        const found = allJudge.find(element => element._id === result.judge);
                        return { ...result, judgeName: `${found.firstName} ${found.lastName}` }
                    })
                    console.log('AllEventScore', AllEventScore)

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
                    console.log('JudgeWithRanking 1: ', JudgeWithRanking);

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

                        console.log('scorePerParticipant ', scorePerParticipant)
                        //Rank Participants based on Score
                        let rankCount = 1;
                        let judgeScores = scorePerParticipant.map(score => {
                            return score.totalScore;
                        })
                        judgeScores = [...new Set(judgeScores)];
                        judgeScores.sort(function (a, b) { return b - a });
                        console.log('judgeScores', judgeScores)
                        let rankPerParticipant = [];
                        judgeScores.forEach(score => {
                            let participants = scorePerParticipant.filter(element => element.totalScore === score);
                            let rank;
                            if (participants.length == 1) {
                                rank = rankCount;
                                console.log('participants', participants, participants.length, rank);
                                rankCount += participants.length;
                            }
                            else if (participants.length > 1) {
                                let tempRankCountOld = rankCount;
                                rankCount += participants.length;
                                rank = (rankCount - 1 + tempRankCountOld) / participants.length;
                                console.log('participants', participants, participants.length, rank);
                            }
                            participants.forEach(participant => {
                                console.log("score", judge.firstName, score, participant, `rank No.: ${rank}`);
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
                    console.log('JudgeWithRanking 2: ', JudgeWithRanking);

                    setRankPerJudge(JudgeWithRanking);
                    // -------------------------------------------------------
                    //SET SCORE PER PARTICIPANT
                    let ParticipantsWithRank = []
                    ParticipantsWithName.forEach(participant => {
                        let participantRecord = [];
                        AllEventScore.forEach(data => {
                            if (participant._id === data.participant) participantRecord.push(data)
                        })

                        let tempParticipantRecord = participant
                        tempParticipantRecord.score = participantRecord
                        ParticipantsWithRank.push(tempParticipantRecord)
                    })
                    console.log('ParticipantsWithRank 1: ', ParticipantsWithRank);

                    ParticipantsWithRank = ParticipantsWithRank.map(participant => {
                        let _rankPerJudge = [];
                        let tempSumOfRank = 0;
                        JudgeWithRanking.forEach(judge => {
                            let ranking = {};
                            let participantScore = judge.participantsRank.find(element => element.participantId === participant._id)
                            console.log('participantScore => ', participantScore);
                            ranking.judge = judge;
                            ranking.score = participantScore.score;
                            ranking.rank = participantScore.rank;
                            tempSumOfRank += ranking.rank;
                            _rankPerJudge.push(ranking);
                        })
                        return { ...participant, rankingPerJudge: _rankPerJudge, sumOfRank: tempSumOfRank }
                    })
                    ParticipantsWithRank = ParticipantsWithRank.sort((a, b) => parseFloat(a.sumOfRank) - parseFloat(b.sumOfRank));
                    console.log('ParticipantsWithRank 2: ', ParticipantsWithRank)

                    let participantsWithFinalRanking = []
                    let rankCount = 1;
                    let rankOfParticipants = ParticipantsWithRank.map(score => {
                        return score.sumOfRank;
                    })
                    rankOfParticipants = [...new Set(rankOfParticipants)];
                    rankOfParticipants.sort(function (a, b) { return a - b });
                    rankOfParticipants.forEach(score => {
                        let participants = ParticipantsWithRank.filter(element => element.sumOfRank === score);
                        let rank;
                        if (participants.length == 1) {
                            rank = rankCount;
                            console.log('participants', participants, participants.length, rank);
                            rankCount += participants.length;
                        }
                        else if (participants.length > 1) {
                            let tempRankCountOld = rankCount;
                            rankCount += participants.length;
                            rank = (rankCount - 1 + tempRankCountOld) / participants.length;
                            console.log('participants', participants, participants.length, rank);
                        }
                        participants.forEach(participant => {
                            participant.finalRank = parseFloat(rank.toFixed(2));
                            participantsWithFinalRanking.push(participant);
                        })
                        console.log('participantsWith Final Ranking', participantsWithFinalRanking)
                    })
                    setEventResult(participantsWithFinalRanking)
                    // -------------------------------------------------------
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
        if (!selectedEvent._id) {
            return toast.error('Sorry. There was an error on your request.');
        }
        axios.put(
            `${process.env.REACT_APP_BACKEND_API}events/detail/${selectedEvent._id}`,
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

    const formatDateAndTime = (value) => {
        const _date = Date.parse(value);
        return format(_date, "MMMM d, yyyy - h:mma");;
    };

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
                    <Box sx={{ ...style, width: '80%', height: '80%' }}>
                        <h3>Event Name:</h3>
                        <h2 id="child-modal-title">{selectedEvent.name}</h2>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="left">Participant Name</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {eventResult.map((row) => (
                                        <TableRow
                                            key={row._id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell align="left">{row.name}</TableCell>
                                            {row.rankingPerJudge.map((rankingPerJudge) => (
                                                <TableCell key={rankingPerJudge.judge._id} align="right">
                                                    <TextField
                                                        name={rankingPerJudge._id}
                                                        label={`${rankingPerJudge.judge.firstName} ${rankingPerJudge.judge.lastName}`}
                                                        value={rankingPerJudge.rank}
                                                        // type="number"
                                                        inputProps={{ inputMode: 'numeric', pattern: '[1-100]*' }}
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                        variant="outlined"
                                                        readOnly
                                                    />
                                                </TableCell>
                                            ))}
                                            <TableCell align="right">
                                                <TextField
                                                    label='Total Rank Sum'
                                                    value={row.sumOfRank}
                                                    // type="number"
                                                    inputProps={{ inputMode: 'numeric', pattern: '[1-100]*' }}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    variant="filled"
                                                    readOnly
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    label='Final Ranking'
                                                    value={row.finalRank}
                                                    // type="number"
                                                    inputProps={{ inputMode: 'numeric', pattern: '[1-100]*' }}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    variant="filled"
                                                    readOnly
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* TABLE FOR PARTICIPANT RANK PER JUDGE */}
                        <Divider />
                        <h3>Participants Rank per Judge:</h3>
                        {rankPerJudge.map((judge) => (
                            // <h4></h4>
                            <div key={judge._id}>
                                <h4> Judge: {judge.firstName} {judge.lastName}</h4>
                                < TableContainer component={Paper} >
                                    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="left"></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {judge.participantsRank.map((participant) => (
                                                <TableRow
                                                    key={participant.participant._id}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <TableCell align="left">
                                                        {participant.participant.name}
                                                    </TableCell>
                                                    {/* {participant.participant.score.map((scorePerCategory) => (
                                                        <TableCell align="right">
                                                            <TextField
                                                                label={scorePerCategory.criteriaName}
                                                                value={scorePerCategory.score}
                                                                inputProps={{ inputMode: 'numeric', pattern: '[1-100]*' }}
                                                                InputLabelProps={{
                                                                    shrink: true,
                                                                }}
                                                                variant="outlined"
                                                                readOnly
                                                            />
                                                        </TableCell>
                                                    ))} */}
                                                    <TableCell align="right">
                                                        <TextField
                                                            label='Total Score'
                                                            value={participant.score}
                                                            inputProps={{ inputMode: 'numeric', pattern: '[1-100]*' }}
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}
                                                            variant="outlined"
                                                            readOnly
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <TextField
                                                            label='Rank'
                                                            value={participant.rank}
                                                            inputProps={{ inputMode: 'numeric', pattern: '[1-100]*' }}
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}
                                                            variant="filled"
                                                            readOnly
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Divider />
                            </div>
                        ))}

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
                                            <TableCell align="right">{formatDateAndTime(row.dateTime)}</TableCell>
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