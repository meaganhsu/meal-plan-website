import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import records from "./routes/dish.js";
import calendar from './routes/calendar.js';

// loading environment variables
dotenv.config();

const PORT = process.env.PORT || 5173;
const API_URL = process.env.VITE_API_URL || 'http://localhost:5173';

const app = express();

app.use(cors({
    origin: API_URL,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
}));

app.use(express.json());
app.use("/record", records);
app.use('/api/calendar', calendar);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});