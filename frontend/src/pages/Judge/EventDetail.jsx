import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { format } from "date-fns";
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import PersonIcon from '@mui/icons-material/Person';
import { TextField, Switch } from '@mui/material';
import { blue } from '@mui/material/colors';

import RatingTable from './RatingTable';
import RankingTable from './RankingTable';

//@MAINFUNCTION
function EventDetail({ event, participants, criteria, judges }) {
    const [selectedEvent, setSelectedEvent] = useState(event);
    const [participantList, setParticipantList] = useState([]);

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
    //@UPDATE Judge Score -------------------------------------------
    const formatDateAndTime = (value) => {
        const _date = Date.parse(value);
        return format(_date, "MMMM d, yyyy - h:mma");
    };

    const showScoringComponent = () => {
        // SHOW SCORING TABLE IF SCORING TYPE IS RATING
        if (selectedEvent.scoringType === 'Rating') {
            return (
                <RatingTable event={event} participants={participants} criteria={criteria} judges={judges} />
            )
        }
        // SHOW SCORING TABLE IF SCORING TYPE IS RANKING
        else if (selectedEvent.scoringType === 'Ranking') {
            return (
                <RankingTable event={event} participants={participants} criteria={criteria} judges={judges} />
            )
        }
        else if (selectedEvent.scoringType === 'Rating-Ranking') {
            return (
                <RatingTable event={event} participants={participants} criteria={criteria} judges={judges} />
            )
        }
    }

    //@SHOW UI
    return (
        <>
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
        </>
    )
}


export default EventDetail