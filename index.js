import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import records from "./routes/dish.js";
import calendar from './routes/calendar.js';

// loading environment variables
dotenv.config();

const PORT = process.env.PORT || 5050;
const app = express();

// for development, allow both localhost and production URL
const allowedOrigins = [
    'http://localhost:5173', process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
}));

app.use(express.json());
app.use("/record", records);
app.use('/api/calendar', calendar);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('API URL:', import.meta.env.VITE_API_URL);
});