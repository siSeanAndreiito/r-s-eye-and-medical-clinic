const express = require('express');
const cors = require('cors');
const app = express();

// Allow requests from any origin
app.use(cors());

app.use(express.json());

const auth = require('./config/auth.js');

app.get('/', (req, res) => res.send('API Running'));

app.use('/auth', auth);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
