const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRouter = require('./src/routes/authRoutes');


dotenv.config();
const app = express();
const port = process.env.PORT || 3005;

app.use(cors());
// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRouter);


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});