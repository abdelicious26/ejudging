const express = require('express');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const port = process.env.PORT || 5000;
const dbconnect = process.env.DBCONNECT;
const connectDB = require('./config/database');
const app = express();

connectDB();

app.use(cors({
    origin: "*",
    methods: ['GET','POST','PUT']
}));
app.use(express.json());

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const eventRoutes = require('./routes/eventRoutes');
app.use('/api/events', eventRoutes);

const criteriaRoutes = require('./routes/criteriaRoutes');
app.use('/api/criteria', criteriaRoutes);

const participantRoutes = require('./routes/participantRoutes');
app.use('/api/participant', participantRoutes);

const scoreRoutes = require('./routes/scoreRoutes');
app.use('/api/judge', scoreRoutes);

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
});

// app.listen(port, '192.168.100.3' || 'localhost', () => {
//     console.log(`Listening to requests on http://localhost:${port}`);
// });