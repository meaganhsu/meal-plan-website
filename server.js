import 'dotenv/config';
import express from "express";
import cors from "cors";
import records from "./routes/dish.js";
import calendar from './routes/calendar.js';

const PORT = process.env.PORT || 5173;
const app = express();

// Update CORS for production
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://meaganhsu.github.io/meal-planning-website/'
        : 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
}));

app.use(express.json());
app.use("/record", records);
app.use('/api/calendar', calendar);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});