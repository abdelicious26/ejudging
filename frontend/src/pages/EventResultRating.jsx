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

function EventResultRating({ selectedEventFromParent, eventScoresFromParent, allJudgeFromParent, allCriteriaFromParent, allParticipantsFromParent }) {

    //@VARIABLES
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [allJudge, setAllJudge] = useState(allJudgeFromParent);
    const [allCriteria, setAllCriteria] = useState(allCriteriaFromParent);
    const [allParticipants, setAllParticipants] = useState(allParticipantsFromParent);
    const [selectedEvent, setSelectedEvent] = useState(selectedEventFromParent);
    const [eventResult, setEventResult] = useState([]);

    //@USE EFFECT
    useEffect(() => {
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

        let _ParticipantTotalScore = ParticipantsWithName.map(participant => {
            let _tempAverageScore = 0;
            const _participantScores = AllEventScore.filter(res => res.participant === participant._id);
            _participantScores.forEach(res => {
                _tempAverageScore += res.percent * res.score / 100;
            })
            _tempAverageScore = _tempAverageScore / JudgeWithName.length;
            _tempAverageScore = parseFloat(_tempAverageScore.toFixed(2));
            return { ...participant, averageScore: _tempAverageScore };
        });

        let _averageScores = _ParticipantTotalScore.map(score => {
            return score.averageScore;
        })
        _averageScores = [...new Set(_averageScores)];
        _averageScores.sort(function (a, b) { return b - a });

        let rankCount = 1;
        let rankPerParticipant = [];
        _averageScores.forEach(row => {
            let _participants = _ParticipantTotalScore.filter(_participant => _participant.averageScore === row);
            let rank;
            if (_participants.length == 1) {
                rank = rankCount;
                rankCount += _participants.length;
            }
            else if (_participants.length > 1) {
                let tempRankCountOld = rankCount;
                rankCount += _participants.length;
                rank = (rankCount - 1 + tempRankCountOld) / _participants.length;
            }
            _participants.forEach(participant => {
                let participantRank = participant;
                participantRank.rank = parseFloat(rank.toFixed(2));
                rankPerParticipant.push(participantRank);
            })
        })
        setEventResult(rankPerParticipant);
    }, [])

    return (
        //@SHOW UI
        <TableContainer component={Paper} sx={{ my: 1 }}>
            <Table sx={{ minWidth: 650 }} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell align="left">Participant Name</StyledTableCell>
                        <StyledTableCell align="right">Average Score</StyledTableCell>
                        <StyledTableCell align="right">Final Rank</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {eventResult.map((row) => (
                        <StyledTableRow key={row._id}>
                            <StyledTableCell component="th" scope="row" align="left">
                                {row.name}
                            </StyledTableCell>
                            <StyledTableCell align="right">{row.averageScore}</StyledTableCell>
                            <StyledTableCell align="right">{row.rank}</StyledTableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default EventResultRating