import express from 'express';
import db from '../db/connection.js';
import { format, startOfWeek, addWeeks } from 'date-fns';

const router = express.Router();

const formatDate = (date) => {
    return format(date, 'yyyy-MM-dd');
};

// get meal plan for a specific week
router.get('/:weekStart', async (req, res) => {
    try {
        const weekStart = req.params.weekStart;
        console.log('GET /api/calendar/:weekStart - Fetching meal plan for week:', weekStart);

        const archiveCollection = db.collection('archive');
        const mealPlan = await archiveCollection.findOne({ weekStart: weekStart });

        console.log('Found meal plan:', mealPlan);

        if (!mealPlan) {
            console.log('No meal plan found for week:', weekStart);
            return res.status(404).json({
                message: 'No meal plan found for this week',
                lunch: {},
                dinner: {}
            });
        }

        res.json({
            lunch: mealPlan.lunch || {},
            dinner: mealPlan.dinner || {}
        });
    } catch (e) {
        console.error('Error fetching meal plan:', e);
        res.status(500).json({ message: 'Server error', error: e.message });
    }
});

// create or update a meal plan
router.post('/', async (req, res) => {
    try {
        console.log('POST /api/calendar - Request body:', JSON.stringify(req.body, null, 2));

        const { weekStart, lunch, dinner } = req.body;

        if (!weekStart) {
            console.error('Missing weekStart in request');
            return res.status(400).json({ message: 'weekStart is required' });
        }

        const archiveCollection = db.collection('archive');

        const mealPlanDoc = {
            weekStart: weekStart,
            lunch: lunch || {},
            dinner: dinner || {},
            lastUpdated: new Date()
        };

        console.log('Saving meal plan:', JSON.stringify(mealPlanDoc, null, 2));

        // update or insert meal plan
        const result = await archiveCollection.replaceOne(
            { weekStart: weekStart },
            mealPlanDoc,
            { upsert: true }
        );

        console.log('MongoDB result:', result);

        res.json({
            message: 'Meal plan saved successfully',
            weekStart: weekStart,
            result: {
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount,
                upsertedCount: result.upsertedCount
            }
        });
    } catch (e) {
        console.error('Error saving meal plan:', e);
        res.status(500).json({ message: 'Server error', error: e.message });
    }
});

// initialise new empty weeks
router.post('/initialise-weeks', async (req, res) => {
    try {
        const archiveCollection = db.collection('archive');
        const today = new Date();
        const initialised = [];

        // get mon of current week
        const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });

        // initialise current week + next 2 weeks
        for (let i = 0; i < 3; i++) {
            const weekStart = formatDate(addWeeks(currentWeekStart, i));

            // check if this week exists
            const existingPlan = await archiveCollection.findOne({ weekStart: weekStart });

            if (!existingPlan) {
                await archiveCollection.insertOne({
                    weekStart: weekStart,
                    lunch: {},
                    dinner: {},
                    createdAt: new Date(),
                    lastUpdated: new Date()
                });
                initialised.push(weekStart);
            }
        }

        res.json({
            message: 'Week initialisation complete',
            initializedWeeks: initialised
        });
    } catch (e) {
        console.error('Error initialising weeks:', e);
        res.status(500).json({ message: 'Server error', error: e.message });
    }
});

export default router;