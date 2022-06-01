import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import EventIcon from '@mui/icons-material/Event';
import { useEffect } from 'react'
import BorderColorIcon from '@mui/icons-material/BorderColor';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import IconButton from '@mui/material/IconButton';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { logout, reset } from '../features/auth/authSlice'
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { useSelector, useDispatch } from 'react-redux'
const drawerWidth = 240;


function Sidebar() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    let token
    useEffect(() => {
        if (!user) {
            navigate('/login')
        }
        else (
            console.log(user.recordType)
        )
    }, [user, navigate])

    const onLogout = () => {
        console.log('logging out')
        dispatch(logout())
        dispatch(reset())
        navigate('/login')
    }

    const displaySidebar = () => {
        if (user.recordType === 'judge') {
            return (
                <div>
                    <CssBaseline />
                    <Drawer
                        sx={{
                            width: drawerWidth,
                            flexShrink: 0,
                            '& .MuiDrawer-paper': {
                                width: drawerWidth,
                                boxSizing: 'border-box',
                            },
                        }}
                        variant="permanent"
                        anchor="left"
                    >
                        <Toolbar />
                        <Divider />
                        <List>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => navigate('/judge')}>
                                    <ListItemIcon>
                                        <EventIcon />
                                    </ListItemIcon>
                                    <ListItemText >Events</ListItemText>
                                </ListItemButton>
                            </ListItem>
                            <Divider />
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => console.log('Open My Account')}>
                                    <ListItemIcon>
                                        <AccountBoxIcon />
                                    </ListItemIcon>
                                    <ListItemText> My Account</ListItemText>
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={onLogout}>
                                    <ListItemIcon>
                                        <ExitToAppIcon />
                                    </ListItemIcon>
                                    <ListItemText> Logout</ListItemText>
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Drawer>
                </div>
            )
        }

        else if (user.recordType === 'admin') {
            return (
                <div>
                    <CssBaseline />
                    <Drawer
                        sx={{
                            width: drawerWidth,
                            flexShrink: 0,
                            '& .MuiDrawer-paper': {
                                width: drawerWidth,
                                boxSizing: 'border-box',
                            },
                        }}
                        variant="permanent"
                        anchor="left"
                    >
                        <Toolbar />
                        <Divider />
                        <List>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => navigate('/')}>
                                    <ListItemIcon>
                                        <HomeIcon />
                                    </ListItemIcon>
                                    <ListItemText> Dashboard</ListItemText>
                                </ListItemButton>
                            </ListItem>
                            <Divider />
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => navigate('/latestevents')}>
                                    <ListItemIcon>
                                        <EventIcon />
                                    </ListItemIcon>
                                    <ListItemText > Latest Events</ListItemText>
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => navigate('/createevent')}>
                                    <ListItemIcon>
                                        <BorderColorIcon />
                                    </ListItemIcon>
                                    <ListItemText> Create Event</ListItemText>
                                </ListItemButton>
                            </ListItem>
                            <Divider />
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <ListItemIcon>
                                        <SettingsSuggestIcon />
                                    </ListItemIcon>
                                    <ListItemText> Maintenance</ListItemText>
                                </ListItemButton>
                            </ListItem>

                            <ListItem disablePadding>
                                <ListItemButton onClick={() => navigate('/users')}>
                                    <ListItemIcon>

                                    </ListItemIcon>
                                    <ListItemText> Users</ListItemText>
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => navigate('/participants')}>
                                    <ListItemIcon>

                                    </ListItemIcon>
                                    <ListItemText> Participants</ListItemText>
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => navigate('/criteria')}>
                                    <ListItemIcon>

                                    </ListItemIcon>
                                    <ListItemText> Criteria</ListItemText>
                                </ListItemButton>
                            </ListItem>
                            <Divider />
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => console.log('Open My Account')}>
                                    <ListItemIcon>
                                        <AccountBoxIcon />
                                    </ListItemIcon>
                                    <ListItemText> My Account</ListItemText>
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={onLogout}>
                                    <ListItemIcon>
                                        <ExitToAppIcon />
                                    </ListItemIcon>
                                    <ListItemText> Logout</ListItemText>
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Drawer>
                </div>
            )
        }
    }

    const displayAdminSidebar = () => {
    }

    return (
        <>
            {displaySidebar()}
        </>
    )

}

export default Sidebar