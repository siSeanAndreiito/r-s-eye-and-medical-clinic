const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.use(express.json());

const auth = require('./config/auth.js');
const admin = require('./config/admin.js');
const appointment = require('./config/appointment.js');

app.get('/', (req, res) => res.send('API Running'));

app.use('/auth', auth);
app.use('/admin', admin);
app.use('/appointment', appointment);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
