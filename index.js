import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import records from "./routes/dish.js";
import calendar from './routes/calendar.js';

// loading environment variables
dotenv.config();

const PORT = process.env.PORT || 5050;
const app = express();

const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ''
    : 'http://localhost:5173';

app.use(cors({
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    origin: allowedOrigins
}));

app.use(express.json());
app.use("/record", records);
app.use('/api/calendar', calendar);

// health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});