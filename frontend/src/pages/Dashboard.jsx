import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import axios from 'axios'

//import "@fullcalendar/core/main.css";
import "@fullcalendar/daygrid/main.css";

function Dashboard() {
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const [allEvents, setAllEvents] = useState([]);
    let token
    useEffect(() => {
        console.log(process.env.SECRET)
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
            'http://localhost:5000/api/events/',
            { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                //console.log(response.data)
                if (response) {
                    console.log('binasa')
                    setAllEvents("No Event Records")
                    let temporaryList = [];
                    response.data.forEach(element => {
                        let temporaryRecord ={};
                        temporaryRecord.title = element.name
                        temporaryRecord.date = element.dateTime
                        console.log(temporaryRecord)
                        temporaryList.push(temporaryRecord)
                    });
                    setAllEvents(temporaryList);
                    console.log(temporaryList);
                }
            })
    }, [user, navigate])

    return (
        <>
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