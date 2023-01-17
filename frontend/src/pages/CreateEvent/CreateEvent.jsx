import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-calendar-datetime-picker/dist/index.css'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useTheme, styled } from '@mui/material/styles';
import { arrayMoveImmutable } from "array-move";
import {
    TextField, Input, Button, InputLabel, OutlinedInput, MenuItem, FormControl,
    StepLabel, Step, Stepper, Stack, Paper, Grid, CardContent, Card, CssBaseline, Checkbox,
    List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, Select, Box
} from '@mui/material';
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { Container, Draggable } from "react-smooth-dnd";
const backend = process.env.BACKEND;

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

    const [page, setPage] = useState(0);
    const formTitles = ['Event Info', 'Criteria', 'Judges', 'Participants']

    useEffect(() => {
        axios.get(
            `${process.env.REACT_APP_BACKEND_API}users/active`,
            { headers: { "Authorization": `Bearer ${token}` } })
            .then(response => {
                if (!response) return setGetJudge("No Active Judge Records")
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
        axios.get(
            `${process.env.REACT_APP_BACKEND_API}participant/active`,
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
            })
        axios.get(
            `${process.env.REACT_APP_BACKEND_API}criteria/active`,
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
                tempCriteriaList.sort(function (a, b) { return b - a });
                setGetCriteria(tempCriteriaList);
                setShowCriteria(tempActiveCriteria);
            })
    })

    //@ USE EFFECT CHECKING OF CRITERIA
    useEffect(() => {
        let tempCriteriaList = []
        let criteriaOrderNumber = 1;
        selectedCriteria.forEach(criteriaName => {
            const index = getCriteria.findIndex(object => {
                return object.name === criteriaName;
            })
            if (index != null) {
                const tempId = getCriteria[index].id;
                let tempCriteriaRecord = {};
                tempCriteriaRecord.name = criteriaName;
                tempCriteriaRecord.id = tempId;
                tempCriteriaRecord.percent = 1;
                tempCriteriaRecord.orderNumber = criteriaOrderNumber;
                tempCriteriaList.push(tempCriteriaRecord);
                criteriaOrderNumber++;
            }
        })
        setSaveCriteria(tempCriteriaList)
    }, [selectedCriteria])

    //@ USE EFFECT CHECKING OF PARTICIPANT AND JUDGE
    useEffect(() => {
        let judgeId = [];
        let judgeOrderNumber = 1;
        selectedJudge.forEach(judgeName => {
            let _judge = {}
            const index = getJudge.findIndex(object => {
                return object.name === judgeName;
            })
            if (index != null) {
                const tempId = getJudge[index].id;
                _judge.userId = tempId;
                _judge.orderNumber = judgeOrderNumber;
                judgeId.push(_judge);
                judgeOrderNumber++;
            }
        })
        setSaveJudge(judgeId)
        let participantId = []
        let participantOrderNumber = 1;
        selectedParticipant.forEach(participantName => {
            let _participant = {}
            const index = getParticipant.findIndex(object => {
                return object.name === participantName;
            })
            if (index != null) {
                const tempId = getParticipant[index].id;
                _participant.participantId = tempId;
                _participant.orderNumber = participantOrderNumber;
                participantId.push(_participant)
                participantOrderNumber++;
            }
        })
        setSaveParticipant(participantId)
    }, [selectedParticipant, selectedJudge])


    const [newEvent, setNewEvent] = useState({
        name: '',
        description: '',
        venue: '',
        scoringType: ''
    });
    const [dateTime, setDateTime] = useState(new Date());

    const { name, description, venue, scoringType } = newEvent

    //@ONSUBMIT -----------------------------
    const onSubmit = (e) => {
        e.preventDefault()
        let isError = false;
        if (name === '' || description === '' || venue === '' || dateTime === '') {
            toast.error('Please fill out all the Event Info');
            isError = true;
        }
        if (!scoringType) {
            toast.error('You did not select Scoring Type');
            isError = true;
        }
        if (selectedCriteria.length === 0) {
            toast.error('You did not select any Criteria ');
            isError = true;
        }
        if (selectedJudge.length === 0) {
            toast.error('You did not select any Judges');
            isError = true;
        }
        if (selectedParticipant.length === 0) {
            toast.error('You did not select any Participants');
            isError = true;
        }
        if (isError) return console.log('Error saving')
        else {
            console.log('saveJudge', saveJudge);
            console.log('saveParticipant', saveParticipant);
            console.log('saveCriteria', saveCriteria);
            // return;
            axios.post(
                `${process.env.REACT_APP_BACKEND_API}events/`,
                {
                    name: name,
                    description: description,
                    venue: venue,
                    dateTime: dateTime,
                    scoringType: scoringType
                },
                { headers: { "Authorization": `Bearer ${token}` } })
                .then((response) => {
                    setNewEvent({
                        name: '',
                        description: '',
                        venue: '',
                        scoringType: ''
                    })

                    //@SAVING JUDGE ON DATABASE
                    saveJudge.forEach(judge => {
                        axios.put(
                            `${process.env.REACT_APP_BACKEND_API}events/detail/judge/${response.data._id}`,
                            {
                                userId: judge.userId,
                                orderNumber: judge.orderNumber
                            },
                            { headers: { "Authorization": `Bearer ${token}` } })
                            .catch((error) => {
                                console.log(error)
                            })
                    })

                    //@SAVING PARTICIPANT ON DATABASE
                    saveParticipant.forEach(participant => {
                        axios.put(
                            `${process.env.REACT_APP_BACKEND_API}events/detail/participant/${response.data._id}`,
                            {
                                participantId: participant.participantId,
                                orderNumber: participant.orderNumber
                            },
                            { headers: { "Authorization": `Bearer ${token}` } })
                            .catch((error) => {
                                console.log(error)
                            })
                    })

                    //@SAVING PARTICIPANT ON DATABASE
                    saveCriteria.forEach(criteria => {
                        axios.put(
                            `${process.env.REACT_APP_BACKEND_API}events/detail/criteria/${response.data._id}`,
                            {
                                criteriaId: criteria.id,
                                percent: parseInt(criteria.percent),
                                orderNumber: criteria.orderNumber
                            },
                            { headers: { "Authorization": `Bearer ${token}` } })
                            .catch((error) => {
                                console.log(error)
                            })
                    })

                    setDateTime(new Date())
                    toast.success('New Event Created');
                    navigate('/')
                })
                .catch((error) => {
                    toast.error('Sorry, there was an error. Please make sure you fill out all the fields');
                }
                )
        }
    }

    //@ONCHANGE -----------------------------
    const onChange = (event) => {
        setNewEvent((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value,
        }))
    }

    const onChangeScore = (event) => {
        const tempSaveCriteria = saveCriteria.map(criteria => {
            if (criteria.name === event.target.name) {
                return { ...criteria, percent: event.target.value };
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

    const onDropCriteria = ({ removedIndex, addedIndex }) => {
        setSelectedCriteria(items => arrayMoveImmutable(items, removedIndex, addedIndex));
    };

    const onDropJudge = ({ removedIndex, addedIndex }) => {
        setSelectedJudge(items => arrayMoveImmutable(items, removedIndex, addedIndex));
    };

    const onDropParticipant = ({ removedIndex, addedIndex }) => {
        setSelectedParticipant(items => arrayMoveImmutable(items, removedIndex, addedIndex));
    };

    //@FORM PAGES -----------------------------
    const FormPages = () => {
        if (page === 0) {
            return (
                <div>
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
                    {/* <InputLabel>Scoring Type</InputLabel>
                    <Select id='newRecordType'
                        name='newRecordType'
                        options={RecordType}
                        // onChange={onChangeDropdownNew}
                        fullWidth
                        // value={RecordType.filter(({ value }) => value === newUser.newRecordType)}
                        /> */}
                    <InputLabel>Date and Time</InputLabel>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
                            renderInput={(props) => <TextField {...props} />}
                            value={dateTime}
                            required
                            fullWidth
                            onChange={(newValue) => {
                                setDateTime(newValue);
                            }}
                        />
                    </LocalizationProvider>
                </div>
            )
        }
        else if (page === 1) {
            return (
                <div>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Item>
                                <FormControl sx={{ m: 1, minWidth: 180 }}>
                                    <InputLabel id="scoringType-label">Scoring Type</InputLabel>
                                    <Select
                                        labelId="scoringType-label"
                                        id="scoringType"
                                        name="scoringType"
                                        autoWidth
                                        value={scoringType}
                                        onChange={onChange}
                                        label="Scoring Type"
                                    >
                                        <MenuItem value=""><em>None</em></MenuItem>
                                        <MenuItem value='Ranking'>Ranking</MenuItem>
                                        <MenuItem value='Rating'>Rating</MenuItem>
                                    </Select>
                                </FormControl>
                            </Item>
                        </Grid>

                        {scoringType ? (
                            <>
                                <Grid item xs={12}>
                                    <Item>
                                        <FormControl sx={{ m: 1, width: 400 }}>
                                            <InputLabel id="demo-multiple-chip-label">Criteria</InputLabel>
                                            <Select
                                                labelId="demo-multiple-checkbox-label"
                                                id="demo-multiple-checkbox"
                                                multiple
                                                value={selectedCriteria}
                                                onChange={handleChangeCriteria}
                                                input={<OutlinedInput label="Tag" />}
                                                renderValue={(selected) => selected.join(', ')}
                                                MenuProps={MenuProps}
                                            >
                                                {showCriteria.map((name) => (
                                                    <MenuItem key={name} value={name} style={getStyles(name, selectedCriteria, theme)}>
                                                        <Checkbox checked={selectedCriteria.indexOf(name) > -1} />
                                                        <ListItemText primary={name} />
                                                    </MenuItem>
                                                ))}
                                            </Select>

                                        </FormControl>
                                        <Button hidden={true} variant="contained">Add</Button>
                                    </Item>
                                </Grid>
                                <Grid item xs={12}>
                                    <Item>
                                        <div className='form-group'>
                                            <Box sx={{
                                                border: 1,
                                                borderRadius: '12px',
                                            }}>
                                                <InputLabel sx={{ fontSize: 18, fontWeight: 'bold' }}>Selected Criteria</InputLabel>
                                                <List>
                                                    <Container dragHandleSelector=".drag-handle" lockAxis="y" onDrop={onDropCriteria}>
                                                        {saveCriteria.map((criteria) => (
                                                            <Draggable key={criteria.id}>
                                                                <ListItem>
                                                                    <ListItemText primary={criteria.name} />
                                                                    <ListItemSecondaryAction>
                                                                        <ListItemIcon className="drag-handle">
                                                                            <DragHandleIcon />
                                                                        </ListItemIcon>
                                                                    </ListItemSecondaryAction>
                                                                </ListItem>
                                                            </Draggable>
                                                        ))}
                                                    </Container>
                                                </List>
                                            </Box>
                                            {scoringType === 'Rating' ? (
                                                <table>
                                                    <thead>

                                                        <tr>
                                                            <th>Criteria Name</th>
                                                            <th>Ratings (%)</th>
                                                        </tr>
                                                        <tr>
                                                            <th>Criteria Name</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            saveCriteria.map(data => {
                                                                return (
                                                                    <tr key={data.id}>
                                                                        <td>{data.name}</td>
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
                                                                        <td>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                        }
                                                    </tbody>
                                                </table>

                                            ) : (
                                                <></>
                                            )}

                                        </div>
                                    </Item>
                                </Grid>
                            </>
                        ) : (
                            <>  </>
                        )}

                    </Grid>
                </div>
            )
        }
        else if (page === 2) {
            return (
                <div>
                    <section>
                        {/* JUDGES */}
                        <Card variant="outlined" sx={{ minWidth: 275 }}>
                            <CardContent>
                                <FormControl sx={{ m: 1, width: 400 }}>
                                    <InputLabel id="demo-multiple-chip-label">Select Judges</InputLabel>
                                    <Select
                                        labelId="demo-multiple-checkbox-label"
                                        id="demo-multiple-checkbox"
                                        multiple
                                        value={selectedJudge}
                                        onChange={handleChangeJudge}
                                        input={<OutlinedInput label="Tag" />}
                                        renderValue={(selected) => selected.join(', ')}
                                        MenuProps={MenuProps}
                                    >
                                        {showJudge.map((name) => (
                                            <MenuItem key={name} value={name} style={getStyles(name, selectedJudge, theme)}>
                                                <Checkbox checked={selectedJudge.indexOf(name) > -1} />
                                                <ListItemText primary={name} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <List>
                                    <Container dragHandleSelector=".drag-handle" lockAxis="y" onDrop={onDropJudge}>
                                        {selectedJudge.map((judge) => (
                                            <Draggable key={judge}>
                                                <ListItem>
                                                    <ListItemText primary={judge} />
                                                    <ListItemSecondaryAction>
                                                        <ListItemIcon className="drag-handle">
                                                            <DragHandleIcon />
                                                        </ListItemIcon>
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                            </Draggable>
                                        ))}
                                    </Container>
                                </List>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            )
        }

        else if (page === 3) {
            return (
                <div>
                    <section>
                        {/* PARTICIPANTS */}
                        <Card variant="outlined" sx={{ minWidth: 275 }}>
                            <CardContent>
                                <div>
                                    <FormControl sx={{ m: 1, width: 400 }}>
                                        <InputLabel id="demo-multiple-chip-label">Participants</InputLabel>
                                        <Select
                                            labelId="demo-multiple-checkbox-label"
                                            id="demo-multiple-checkbox"
                                            multiple
                                            value={selectedParticipant}
                                            onChange={handleChangeParticipant}
                                            input={<OutlinedInput label="Tag" />}
                                            renderValue={(selected) => selected.join(', ')}
                                            MenuProps={MenuProps}
                                        >
                                            {showParticipant.map((name) => (
                                                <MenuItem key={name} value={name} style={getStyles(name, selectedParticipant, theme)}>
                                                    <Checkbox checked={selectedParticipant.indexOf(name) > -1} />
                                                    <ListItemText primary={name} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <List>
                                        <Container dragHandleSelector=".drag-handle" lockAxis="y" onDrop={onDropParticipant}>
                                            {selectedParticipant.map((participant) => (
                                                <Draggable key={participant}>
                                                    <ListItem>
                                                        <ListItemText primary={participant} />
                                                        <ListItemSecondaryAction>
                                                            <ListItemIcon className="drag-handle">
                                                                <DragHandleIcon />
                                                            </ListItemIcon>
                                                        </ListItemSecondaryAction>
                                                    </ListItem>
                                                </Draggable>
                                            ))}
                                        </Container>
                                    </List>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            )
        }
    }


    return (
        <>
            <CssBaseline />
            <>
                <section className='heading'>
                    <h1>
                        Create New Event
                    </h1>
                </section>
                <Stepper activeStep={[page + 1]}>
                    {formTitles.map((label) => (
                        <Step key={label}
                            sx={{
                                '& .MuiStepLabel-root .Mui-completed': {
                                    color: 'red', // circle color (COMPLETED)
                                },
                                '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel':
                                {
                                    color: 'grey.500', // Just text label (COMPLETED)
                                },
                                '& .MuiStepLabel-root .Mui-active': {
                                    color: 'secondary.main', // circle color (ACTIVE)
                                },
                                '& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel':
                                {
                                    color: 'common.white', // Just text label (ACTIVE)
                                },
                                '& .MuiStepLabel-root .Mui-active .MuiStepIcon-text': {
                                    fill: 'black', // circle's number (ACTIVE)
                                },
                            }}
                        >
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

                                        <Button variant="outlined" className='btn-block' disabled={page === 0} onClick={() => { setPage((currentPage) => currentPage - 1) }} >Previous</Button>
                                        <Button hidden={page === formTitles.length - 1} variant="outlined" className='btn-block' disabled={page === formTitles.length - 1} onClick={() => { setPage((currentPage) => currentPage + 1) }} >Next</Button>
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