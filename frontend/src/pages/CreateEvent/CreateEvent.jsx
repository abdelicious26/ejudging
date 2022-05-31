import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Spinner from '../../components/Spinner/Spinner'
import axios from 'axios'
import { toast } from 'react-toastify'
import Modal from 'react-modal';
import DtPicker from 'react-calendar-datetime-picker'
import 'react-calendar-datetime-picker/dist/index.css'
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { Input } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import StepLabel from '@mui/material/StepLabel';
import Sidebar from '../../components/Sidebar/Sidebar'

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

function getStyles(name, selectedJudge, theme) {
    return {
        fontWeight:
            selectedJudge.indexOf(name) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}


function CreateEvent() {
    const theme = useTheme();

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const token = user.token
    if (!user) {
        navigate('/login')
    }

    const [selectedJudge, setSelectedJudge] = useState([]);
    const [saveJudge, setSaveJudge] = useState([]);
    const [getJudge, setGetJudge] = useState([]);
    const [showJudge, setShowJudge] = useState([]);

    const [selectedParticipant, setSelectedParticipant] = useState([]);
    const [saveParticipant, setSaveParticipant] = useState([]);
    const [getParticipant, setGetParticipant] = useState([]);
    const [showParticipant, setShowParticipant] = useState([]);

    const [selectedCriteria, setSelectedCriteria] = useState([]);
    const [saveCriteria, setSaveCriteria] = useState([]);
    const [getCriteria, setGetCriteria] = useState([]);
    const [showCriteria, setShowCriteria] = useState([]);
    const [saveCriteriaScore, setSaveCriteriaScore] = useState([]);

    const [page, setPage] = useState(0);
    const formTitles = ['Event Info', 'Criteria', 'Judges and Participants']

    useEffect(() => {
        axios.get(
            'http://localhost:5000/api/users/active',
            { headers: { "Authorization": `Bearer ${token}` } })
            .then(response => {
                if (!response) return setGetJudge("No Active Judge Records")
                // console.log(response.data)
                let tempJudgeList = []
                let tempActiveJudge = []
                response.data.forEach(element => {
                    let fullname = `${element.firstName} ${element.lastName}`
                    let judgeRecord = {};
                    judgeRecord['name'] = fullname;
                    judgeRecord['id'] = element._id;
                    tempJudgeList.push(judgeRecord);
                    tempActiveJudge.push(fullname)
                });
                setGetJudge(tempJudgeList);
                setShowJudge(tempActiveJudge);
            })
        //console.log(showJudge)
        axios.get(
            'http://localhost:5000/api/participant/active',
            { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                if (!response) setGetParticipant("No Active Participant Records")
                let tempParticipantList = []
                let tempActiveParticipant = []
                response.data.forEach(element => {
                    let participantRecord = {};
                    participantRecord['name'] = element.name;
                    participantRecord['id'] = element._id;
                    tempParticipantList.push(participantRecord);
                    tempActiveParticipant.push(element.name)
                });
                setGetParticipant(tempParticipantList);
                setShowParticipant(tempActiveParticipant);
                //console.log(response.data)
            })
        axios.get(
            'http://localhost:5000/api/criteria/active',
            { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                if (!response) setGetCriteria("No Active Criteria Records")
                let tempCriteriaList = []
                let tempActiveCriteria = []
                response.data.forEach(element => {
                    let CriteriaRecord = {};
                    CriteriaRecord['name'] = element.name;
                    CriteriaRecord['id'] = element._id;
                    tempCriteriaList.push(CriteriaRecord);
                    tempActiveCriteria.push(element.name)
                });
                setGetCriteria(tempCriteriaList);
                setShowCriteria(tempActiveCriteria);
            })
    }, [])

    //@ USE EFFECT CHECKING OF CRITERIA
    useEffect(() => {
        console.log(selectedCriteria.length)
        let tempCriteriaList = []
        selectedCriteria.forEach(criteriaName => {
            const index = getCriteria.findIndex(object => {
                return object.name === criteriaName;
            })
            if (index != null) {
                const tempId = getCriteria[index].id;
                let tempCriteriaRecord = {}
                tempCriteriaRecord.name = criteriaName
                tempCriteriaRecord.id = tempId
                tempCriteriaRecord.percent = ''
                tempCriteriaList.push(tempCriteriaRecord)
            }
        })
        setSaveCriteria(tempCriteriaList)

        console.log(tempCriteriaList)
        console.log(saveCriteria.length)

        // let criteria = {}
        // selectedCriteria.forEach(element => {
        //     console.log(element)
        // })

    }, [selectedCriteria])

    //@ USE EFFECT CHECKING OF PARTICIPANT AND JUDGE
    useEffect(() => {
        let judgeId = []
        selectedJudge.forEach(judgeName => {
            const index = getJudge.findIndex(object => {
                return object.name === judgeName;
            })
            if (index != null) {
                const tempId = getJudge[index].id;
                judgeId.push(tempId)
            }
        })
        setSaveJudge(judgeId)
        let participantId = []
        selectedParticipant.forEach(participantName => {
            const index = getParticipant.findIndex(object => {
                return object.name === participantName;
            })
            if (index != null) {
                const tempId = getParticipant[index].id;
                participantId.push(tempId)
            }
        })
        setSaveParticipant(participantId)

        console.log('current page: ' + page)
        console.log('no. of page: ' + formTitles.length)
        console.log('selected Criteria: ' + selectedCriteria.length)
        console.log('selected Participant: ' + selectedParticipant.length)
        console.log('selected Judges: ' + selectedJudge.length)
    }, [selectedParticipant, selectedJudge])


    const [newEvent, setNewEvent] = useState({
        name: '',
        description: '',
        venue: ''
    });
    const [dateTime, setDateTime] = useState(new Date());

    const { name, description, venue } = newEvent
    const [judges, setJudges] = useState([]);
    const [criteria, setCriteria] = useState([]);
    const [participants, setParticipants] = useState([]);

    //@ONSUBMIT -----------------------------
    const onSubmit = (e) => {
        e.preventDefault()
        let isError = false;
        if (name == '' || description == '' || venue == '' || dateTime == '') {
            toast.error('Please fill out all the Event Info');
            isError = true;
        }
        if (selectedCriteria.length == 0) {
            toast.error('You did not select any Criteria ');
            isError = true;
        }
        if (selectedJudge.length == 0) {
            toast.error('You did not select any Judges');
            isError = true;
        }
        if (selectedParticipant.length == 0) {
            toast.error('You did not select any Participants');
            isError = true;
        }
        if (isError) return console.log('Error saving')
        else {
            let URL = 'http://localhost:5000/api/events/'
            axios.post(
                URL,
                {
                    name: name,
                    description: description,
                    venue: venue,
                    dateTime: dateTime
                },
                { headers: { "Authorization": `Bearer ${token}` } })
                .then((response) => {
                    setNewEvent({
                        name: '',
                        description: '',
                        venue: ''
                    })
                    console.log(response.data._id)
                    console.log(saveJudge)

                    //@SAVING JUDGE ON DATABASE
                    saveJudge.forEach(judge => {
                        console.log(judge)
                        axios.put(
                            'http://localhost:5000/api/events/detail/judge/' + response.data._id,
                            {
                                userId: judge
                            },
                            { headers: { "Authorization": `Bearer ${token}` } })
                            .then((save) => {
                                toast.success('Judge Saved')
                                console.log('Judge Saved')
                            })
                            .catch((error) => {
                                console.log(error)
                            })
                    })

                    //@SAVING PARTICIPANT ON DATABASE
                    saveParticipant.forEach(participant => {
                        axios.put(
                            'http://localhost:5000/api/events/detail/participant/' + response.data._id,
                            {
                                participantId: participant
                            },
                            { headers: { "Authorization": `Bearer ${token}` } })
                            .then((save) => {
                                toast.success('Participants Saved')
                                console.log('Participants Saved')
                            })
                            .catch((error) => {
                                console.log(error)
                            })
                    })

                    //@SAVING PARTICIPANT ON DATABASE
                    saveCriteria.forEach(criteria => {
                        axios.put(
                            'http://localhost:5000/api/events/detail/criteria/' + response.data._id,
                            {
                                criteriaId: criteria.id,
                                percent: parseInt(criteria.percent)
                            },
                            { headers: { "Authorization": `Bearer ${token}` } })
                            .then((save) => {
                                toast.success('Criteria Saved')
                                console.log('Criteria Saved')
                            })
                            .catch((error) => {
                                console.log(error)
                            })
                    })

                    setDateTime(new Date())
                    console.log('success')
                    toast.success('New Event Created');
                    navigate('/')
                })
                .catch((error) => {
                    console.log(error)
                    toast.error('Sorry, there was an error. Please make sure you fill out all the fields');
                }
                )
        }
    }

    //@ONCHANGE -----------------------------
    const temporaryFunction = () => {
        console.log(saveCriteria)
    }

    const onChange = (e) => {
        setNewEvent((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }))
    }

    const onChangeScore = (e) => {
        const tempSaveCriteria = saveCriteria.map(criteria => {
            if (criteria.name === e.target.name) {
                return { ...criteria, percent: e.target.value };
            }
            return criteria;
        });
        setSaveCriteria(tempSaveCriteria);
    }


    const handleChangeJudge = (event) => {
        const {
            target: { value },
        } = event;
        setSelectedJudge(
            typeof value === 'string' ? value.split(',') : value,
        );
        console.log(selectedJudge)
    };

    const handleChangeParticipant = (event) => {
        const {
            target: { value },
        } = event;
        setSelectedParticipant(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };
    const handleChangeCriteria = (event) => {
        const {
            target: { value },
        } = event;
        setSelectedCriteria(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };


    //@FORM PAGES -----------------------------
    const FormPages = () => {
        if (page === 0) {
            return (
                <div>
                    <h1>
                    </h1>
                    <div className=''>
                        <InputLabel>Event Name</InputLabel>
                        <TextField
                            type='string'
                            id='name'
                            name='name'
                            fullWidth
                            value={name}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className=''>
                        <InputLabel>Description</InputLabel>
                        <TextField
                            variant='outlined'
                            type='string'
                            id='description'
                            name='description'
                            fullWidth
                            value={description}
                            onChange={onChange}
                        />
                    </div>

                    <div className=''>
                        <InputLabel>Venue</InputLabel>
                        <TextField
                            type='string'
                            id='venue'
                            name='venue'
                            value={venue}
                            fullWidth
                            onChange={onChange}
                            variant="outlined"
                            required
                        />
                    </div>

                    <div className=''>
                        <InputLabel>Date and Time</InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateTimePicker
                                renderInput={(props) => <TextField {...props} />}
                                value={dateTime}
                                required
                                onChange={(newValue) => {
                                    setDateTime(newValue);
                                }}
                            />
                        </LocalizationProvider>
                    </div>
                </div>
            )
        }

        else if (page === 1) {
            return (
                <div>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Item>
                                <div>
                                    <FormControl sx={{ m: 1, width: 400 }}>
                                        <InputLabel id="demo-multiple-chip-label">Criteria</InputLabel>
                                        <Select
                                            labelId="demo-multiple-chip-label"
                                            id="demo-multiple-chip"
                                            multiple
                                            value={selectedCriteria}
                                            onChange={handleChangeCriteria}
                                            input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {selected.map((value) => (
                                                        <Chip key={value} label={value} />
                                                    ))}
                                                </Box>
                                            )}
                                            MenuProps={MenuProps}
                                        >
                                            {showCriteria.map((name) => (
                                                <MenuItem
                                                    key={name}
                                                    value={name}
                                                    style={getStyles(name, selectedCriteria, theme)}
                                                >
                                                    {name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                            </Item>
                        </Grid>
                        <Grid item xs={12}>
                            <Item>
                                <div className='form-group'>
                                    <InputLabel>Selected Criteria</InputLabel>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Criteria Name</th>
                                                <th>Ratings (%)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                saveCriteria.map(data => {
                                                    return (
                                                        <tr key={data.id}>
                                                            <td>{data.name}</td>
                                                            <td>
                                                                <Input
                                                                    type='number'
                                                                    id='venue'
                                                                    name={data.name}
                                                                    fullWidth
                                                                    value={data.percent}
                                                                    onChange={onChangeScore}
                                                                    variant="filled"
                                                                    required
                                                                />
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </Item>
                        </Grid>
                    </Grid>
                </div>
            )
        }
        else if (page === 2) {
            return (
                <div>
                    <section>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Item>
                                    {/* JUDGES */}
                                    <Card variant="outlined" sx={{ minWidth: 275 }}>
                                        <CardContent>
                                            <div>
                                                <FormControl sx={{ m: 1, width: 400 }}>
                                                    <InputLabel id="demo-multiple-chip-label">Select Judges</InputLabel>
                                                    <Select
                                                        labelId="demo-multiple-chip-label"
                                                        id="demo-multiple-chip"
                                                        multiple
                                                        value={selectedJudge}
                                                        onChange={handleChangeJudge}
                                                        input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                                                        renderValue={(selected) => (
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                {selected.map((value) => (
                                                                    <Chip key={value} label={value} />
                                                                ))}
                                                            </Box>
                                                        )}
                                                        MenuProps={MenuProps}
                                                    >
                                                        {showJudge.map((name) => (
                                                            <MenuItem
                                                                key={name}
                                                                value={name}
                                                                style={getStyles(name, selectedJudge, theme)}
                                                            >
                                                                {name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Item>
                            </Grid>
                            <Grid item xs={6}>
                                <Item>
                                    {/* PARTICIPANTS */}
                                    <Card variant="outlined" sx={{ minWidth: 275 }}>
                                        <CardContent>
                                            <div>
                                                <FormControl sx={{ m: 1, width: 400 }}>
                                                    <InputLabel id="demo-multiple-chip-label">Participants</InputLabel>
                                                    <Select
                                                        labelId="demo-multiple-chip-label"
                                                        id="demo-multiple-chip"
                                                        multiple
                                                        value={selectedParticipant}
                                                        onChange={handleChangeParticipant}
                                                        input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                                                        renderValue={(selected) => (
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                {selected.map((value) => (
                                                                    <Chip key={value} label={value} />
                                                                ))}
                                                            </Box>
                                                        )}
                                                        MenuProps={MenuProps}
                                                    >
                                                        {showParticipant.map((name) => (
                                                            <MenuItem
                                                                key={name}
                                                                value={name}
                                                                style={getStyles(name, selectedParticipant, theme)}
                                                            >
                                                                {name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Item>
                            </Grid>
                        </Grid>
                    </section>
                </div>
            )
        }
    }


    return (
        <>
            <Sidebar />
            <CssBaseline />
            {/* <button onClick={temporaryFunction} className='btn btn-block'>
                console log
            </button> */}


            <>
                <section className='heading'>
                    <h1>
                        Create New Event
                    </h1>
                </section>
                <Stepper activeStep={[page + 1]}>
                    {formTitles.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <div>
                    <div className=''>
                        <div className='progress-bar'></div>
                        <div className='container'>
                            <div className='header'></div>
                            <div className='body'></div>

                            <h1> {formTitles[page]}</h1>
                            <form onSubmit={onSubmit}>
                                {FormPages()}
                                <div className='footer'>

                                    <div className='form-group'>
                                    </div>
                                    <Stack spacing={2} direction="row" className='form-group'>

                                        <Button variant="outlined" className='btn-block' disabled={page == 0} onClick={() => { setPage((currentPage) => currentPage - 1) }} >Previous</Button>
                                        <Button hidden={page == formTitles.length - 1} variant="outlined" className='btn-block' disabled={page == formTitles.length - 1} onClick={() => { setPage((currentPage) => currentPage + 1) }} >Next</Button>
                                        <Button hidden={true} variant="contained" type='submit' className='btn-block'>Save</Button>
                                    </Stack>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            </>
        </>
    )
}

export default CreateEvent