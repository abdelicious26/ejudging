import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import { ToastContainer } from 'react-toastify';
import MainPage from './pages/MainPage';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import './App.css';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {

  }, [])
  const showMainPage = () => {
    if (user) {
      return <MainPage />
    }
    else {
      return <Login />
    }
  }

  return (
    <>
      <div className=''>
        <Router>
          <Routes>
            <Route path='/login' element={<Login />} />
          </Routes>
          {showMainPage()}
        </Router>
        <ToastContainer />
      </div >
    </>
  );
}

export default App;
