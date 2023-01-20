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
import { Divider } from '@mui/material';

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


const StyledTableCellPerJudge = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.warning.main,
        color: theme.palette.common.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

function EventResultRanking({ selectedEventFromParent, eventScoresFromParent, allJudgeFromParent, allCriteriaFromParent, allParticipantsFromParent }) {

    //@VARIABLES
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [allJudge, setAllJudge] = useState(allJudgeFromParent);
    const [allCriteria, setAllCriteria] = useState(allCriteriaFromParent);
    const [allParticipants, setAllParticipants] = useState(allParticipantsFromParent);
    const [selectedEvent, setSelectedEvent] = useState(selectedEventFromParent);
    const [eventCriteria, setEventCriteria] = useState([]);
    const [eventResult, setEventResult] = useState([]);
    const [participantRanking, setParticipantRanking] = useState([]);

    //@USE EFFECT
    useEffect(() => {
        //@ GET CRITERIA WITH NAME
        let CriteriaWithName = []
        selectedEvent.criteria.forEach(response => {
            const found = allCriteria.find(element => element._id === response.criteriaId);
            found.orderNumber = response.orderNumber;
            CriteriaWithName.push(found)
        });
        setEventCriteria(CriteriaWithName);
        //@ GET PARTICIPANTS WITH NAME
        let ParticipantsWithName = []
        selectedEvent.participant.forEach(response => {
            const found = allParticipants.find(element => element._id === response.participantId);
            found.orderNumber = response.orderNumber;
            ParticipantsWithName.push(found)
        });
        //@ GET JUDGE WITH NAME
        let JudgeWithName = []
        selectedEvent.judge.forEach(response => {
            const found = allJudge.find(element => element._id === response.userId);
            JudgeWithName.push(found)
        });
        // setSelectedJudge(JudgeWithName)

        let AllEventScore = eventScoresFromParent;
        let FinalRankingTable = JudgeWithName.map(_judge => {
            let Participants = ParticipantsWithName.map(_participant => {
                const Criterias = CriteriaWithName.map(_criteria => {
                    const judgeScore = AllEventScore.find(_judgeScore => _judgeScore.judge === _judge._id && _judgeScore.criteria === _criteria._id && _judgeScore.participant === _participant._id);
                    let _tempCriteria = _criteria;
                    _tempCriteria.rank = judgeScore?.score;
                    return { ..._tempCriteria }
                })
                let _totalPoints = 0;
                Criterias.forEach(res => {
                    _totalPoints += res.rank ? res.rank : 0;
                })
                return { ..._participant, criteria: Criterias, totalPoints: _totalPoints }
            })
            Participants = Participants.sort((a, b) => parseFloat(a.totalPoints) - parseFloat(b.totalPoints));
            return { ..._judge, participant: Participants };
        })
        console.log('FinalRankingTable', FinalRankingTable);
        setEventResult(FinalRankingTable);
        let ParticipantFinalRank = ParticipantsWithName.map(_participant => {
            let sumRank = 0;
            const scores = AllEventScore.filter(_judgeScore => _judgeScore.participant === _participant._id);
            scores.forEach(_score => {
                sumRank += parseInt(_score.score);
            });
            console.log(_participant.name, sumRank);
            return { ..._participant, totalRankPoints: sumRank }
        })


        ParticipantFinalRank = ParticipantFinalRank.sort((a, b) => parseFloat(a.totalRankPoints) - parseFloat(b.totalRankPoints));



        let _RankPoints = ParticipantFinalRank.map(score => {
            return score.totalRankPoints;
        })
        _RankPoints = [...new Set(_RankPoints)];
        _RankPoints.sort(function (a, b) { return a - b });

        let rankCount = 1;
        let rankPerParticipant = [];
        _RankPoints.forEach(row => {
            let _participants = ParticipantFinalRank.filter(_participant => _participant.totalRankPoints === row);
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
        setParticipantRanking(rankPerParticipant);
        console.log('eventResult', eventResult)
    }, [])

    return (
        //@SHOW UI
        <>
            <TableContainer component={Paper} sx={{ my: 1 }}>
                <Table sx={{ minWidth: 650 }} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell align="left">Participant Name</StyledTableCell>
                            <StyledTableCell align="right">Rank Points</StyledTableCell>
                            <StyledTableCell align="right">Final Rank</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {participantRanking.map((_participant) => (
                            <StyledTableRow key={_participant._id}>
                                <StyledTableCell component="th" scope="row" align="left">{_participant.name}</StyledTableCell>
                                <StyledTableCell align="right">{_participant.totalRankPoints}</StyledTableCell>
                                <StyledTableCell align="right">{_participant.rank}</StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Divider />
            <h3>Score per Judge:</h3>

            {eventResult.map((judge) => (
                // <h4></h4>
                <div key={judge._id}>
                    {/* <h4> Judge: {judge.firstName} {judge.lastName}</h4> */}
                    <p id="child-modal-title">Judge Name: <b>{judge.firstName} {judge.lastName}</b></p>
                    < TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                            <TableHead>
                                <StyledTableRow>
                                    <StyledTableCellPerJudge>Participant Name</StyledTableCellPerJudge>
                                    {eventCriteria.map((criteria) => (
                                        <StyledTableCellPerJudge key={criteria._id}>{criteria.name}</StyledTableCellPerJudge>
                                    ))}

                                    <StyledTableCellPerJudge>Total Points</StyledTableCellPerJudge>
                                </StyledTableRow>
                            </TableHead>
                            <TableBody>
                                {judge.participant.map((participant) => (

                                    <StyledTableRow
                                        key={participant._id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >

                                        <StyledTableCellPerJudge>{participant.name}</StyledTableCellPerJudge>
                                        {participant.criteria.map((criteria) => (
                                            <StyledTableCellPerJudge key={criteria._id}>{criteria.rank}</StyledTableCellPerJudge>
                                        ))}
                                        <StyledTableCellPerJudge>{participant.totalPoints}</StyledTableCellPerJudge>
                                    </StyledTableRow>

                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Divider />
                </div>
            ))}
        </>
    )
}

export default EventResultRanking