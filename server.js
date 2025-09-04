import express from "express";
import cors from "cors";
import records from "./routes/dish.js";
import calendar from './routes/calendar.js';

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
}));
app.use(express.json());
app.use("/record", records);
app.use('/api/calendar', calendar);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})