const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRouter = require('./src/routes/authRoutes');
const connectDB = require('./src/config/db');
const http = require('http');
const { Server } = require('socket.io');
const socketModule = require('./src/services/socket/socket')


dotenv.config();
const app = express();
const port = process.env.PORT || 3005;

connectDB();
app.use(cors());
// Middleware to parse JSON bodies
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));

// Routes
app.use('/api/auth', authRouter);


const server = http.createServer(app);

// Create and attach a new Socket.IO instance with CORS options
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

// Initialize our socket module with the Socket.IO instance
socketModule.init(io);

// Handle socket connections
io.on('connection', (client) => {
  console.log(`New client connected: ${client.id}`);

  socketModule.disconnectClient(client, io);

});



server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});