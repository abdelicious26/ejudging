import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import axios from 'axios';
import IconButton from '@mui/material/IconButton';
import HelpIcon from '@mui/icons-material/Help';


import { Box, Button } from '@mui/material';
//import "@fullcalendar/core/main.css";
import "@fullcalendar/daygrid/main.css";

function Dashboard() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [allEvents, setAllEvents] = useState([]);
    let token
    useEffect(() => {
        if (!user) {
            navigate('/login')
        }
        else if (user && user.recordType !== 'admin') {
            navigate('/judge')
        }
        else {
            token = user.token
        }
        axios.get(
            `${process.env.REACT_APP_BACKEND_API}events/`,
            { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                if (response) {
                    setAllEvents("No Event Records")
                    let temporaryList = [];
                    response.data.forEach(element => {
                        let temporaryRecord = {};
                        temporaryRecord.title = element.name
                        temporaryRecord.date = element.dateTime
                        temporaryList.push(temporaryRecord)
                    });
                    setAllEvents(temporaryList);
                    console.log(temporaryList);
                }
            })
    }, [user, navigate])

    return (
        <>
            <Button variant="contained" color="success" size="large">
                Events Created: {allEvents.length}
            </Button>

            <Box
                m={1}
                //margin
                display="flex"
                justifyContent="flex-end"
                alignItems="flex-end"
            >
                <Button variant="contained" color="primary" onClick={() => navigate('/usermanual')} endIcon={<HelpIcon />} size='large'>
                    User Guide
                </Button>
            </Box>

            <div className="App">
                <FullCalendar
                    defaultView="dayGridMonth"
                    plugins={[dayGridPlugin]}
                    events={allEvents}
                />
            </div>
        </>
    )
}

export default Dashboard