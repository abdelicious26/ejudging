import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import EventDetail from './pages/EventDetail/EventDetail'
import EventResult from './pages/EventResult/EventResult'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/Home/Home'
import Judge from './pages/Judge/Judge'
import JudgeScoring from './pages/JudgeScoring/JudgeScoring'
import CreateEvent from './pages/CreateEvent/CreateEvent'
import LatestEvents from './pages/LatestEvents/LatestEvents'
import Login from './pages/Login/Login'
import { ToastContainer } from 'react-toastify'
import MaintenanceCriteria from './pages/MaintenanceCriteria/MaintenanceCriteria'
import MaintenanceEvent from './pages/MaintenanceEvent/MaintenanceEvent'
import MaintenanceParticipant from './pages/MaintenanceParticipant/MaintenanceParticipant'
import MaintenanceUser from './pages/MaintenanceUser/MaintenanceUser'
import Register from './pages/Register/Register'
import Dashboard from './pages/Dashboard/Dashboard'
import Sidebar from './components/Sidebar/Sidebar'
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

function App() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {

  }, [])

  const showSideBar = () => {
    if (user) {
      return <Sidebar />
    }
    else
      return <></>
  }



  return (
    <>
      <Router>
        {showSideBar()}
        <Grid container spacing={1}>
          <Grid item xs={2}>
            <Item>
            </Item>
          </Grid>
          <Grid item xs={10}>
            <Item>
              <Routes>
                <Route path='/' element={<Dashboard />} />
                <Route path='/latestevents' element={<LatestEvents />} />
                <Route path='/createevent' element={<CreateEvent />} />

                <Route path='/criteria' element={<MaintenanceCriteria />} />
                <Route path='/events' element={<MaintenanceEvent />} />
                <Route path='/participants' element={<MaintenanceParticipant />} />
                <Route path='/users' element={<MaintenanceUser />} />

                <Route path='/register' element={<Register />} />
                <Route path='/judge' element={<Judge />} />
                <Route path='/judge/event' element={<JudgeScoring />} />
                <Route path='/login' element={<Login />} />
              </Routes>
            </Item>
          </Grid>
        </Grid>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
