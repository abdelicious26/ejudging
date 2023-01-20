import React from 'react'
import { useState, useEffect } from 'react'
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

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

function EventResultRatingRanking({ selectedEventFromParent, eventScoresFromParent, allEventsFromParent, allJudgeFromParent, allCriteriaFromParent, allParticipantsFromParent }) {

    //@VARIABLES
    // const [allEvents, setAllEvents] = useState(allEventsFromParent);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [allJudge, setAllJudge] = useState(allJudgeFromParent);
    const [allCriteria, setAllCriteria] = useState(allCriteriaFromParent);
    const [allParticipants, setAllParticipants] = useState(allParticipantsFromParent);
    const [selectedEvent, setSelectedEvent] = useState(selectedEventFromParent);
    // const [selectedJudge, setSelectedJudge] = useState([]);
    // const [selectedCriteria, setSelectedCriteria] = useState([]);
    // const [viewModal, setViewModal] = useState(false);
    // const [addModal, setAddModal] = useState(false);
    // const [resultModal, setResultModal] = useState(false);
    // const [rankPerJudge, setRankPerJudge] = useState([]);
    const [eventResult, setEventResult] = useState([]);

    //@USE EFFECT
    useEffect(() => {
        console.log('selectedParticipants', selectedParticipants);
        console.log('allJudge', allJudge);
        console.log('allCriteria', allCriteria);
        console.log('allParticipants', allParticipants);
        console.log('selectedEvent', selectedEvent);
        //@ GET CRITERIA WITH NAME
        let CriteriaWithName = []
        selectedEvent.criteria.forEach(response => {
            const found = allCriteria.find(element => element._id === response.criteriaId);
            found.percent = response.percent
            CriteriaWithName.push(found)
        });
        // setSelectedCriteria(CriteriaWithName)

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
        // setSelectedJudge(JudgeWithName)

        let AllEventScore = []
        AllEventScore = eventScoresFromParent;
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

        ParticipantsWithRank = ParticipantsWithRank.map(participant => {
            let _rankPerJudge = [];
            let tempSumOfRank = 0;
            JudgeWithRanking.forEach(judge => {
                let ranking = {};
                let participantScore = judge.participantsRank.find(element => element.participantId === participant._id)
                ranking.judge = judge;
                ranking.score = participantScore.score;
                ranking.rank = participantScore.rank;
                tempSumOfRank += ranking.rank;
                _rankPerJudge.push(ranking);
            })
            return { ...participant, rankingPerJudge: _rankPerJudge, sumOfRank: tempSumOfRank }
        })
        ParticipantsWithRank = ParticipantsWithRank.sort((a, b) => parseFloat(a.sumOfRank) - parseFloat(b.sumOfRank));

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
                rankCount += participants.length;
            }
            else if (participants.length > 1) {
                let tempRankCountOld = rankCount;
                rankCount += participants.length;
                rank = (rankCount - 1 + tempRankCountOld) / participants.length;
            }
            participants.forEach(participant => {
                participant.finalRank = parseFloat(rank.toFixed(2));
                participantsWithFinalRanking.push(participant);
            })
        })
        setEventResult(participantsWithFinalRanking)
    }, [])

    return (
        //@SHOW UI
        <TableContainer component={Paper} sx={{ my: 1 }}>
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
        </TableContainer>
    )
}

export default EventResultRatingRanking