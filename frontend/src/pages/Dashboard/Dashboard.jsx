import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../../components/Sidebar/Sidebar'

function Dashboard() {
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    useEffect(() => {
        if (!user) {
            navigate('/login')
        }
        if (user && user.recordType !== 'admin') {
            navigate('/judge')
        }
    }, [user, navigate])

    return (
        <>
        <Sidebar />
        </>
    )
}

export default Dashboard