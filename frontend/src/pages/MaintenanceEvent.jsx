import React from 'react'
import Modal from 'react-modal';
import { useState, useEffect } from 'react'

function MaintenanceEvent() {
    const [student, setStudent] = useState([]);
    const [Professor, setProfessor] = useState([]);

    useEffect(() => {
        //add function here every change on selected variables
    }, [student, Professor])



    //MAIN UI
    return (
        <div>
            MaintenanceEvent
        </div>
    )
}

export default MaintenanceEvent