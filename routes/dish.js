import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// get all meals
router.get("/", async (req, res) => {
    try {
        const collection = await db.collection("meals");
        const results = await collection.find({}).toArray();
        res.status(200).send(results);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error fetching meals");
    }
});

// search meals by name
router.get("/search", async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ message: "Search term is required" });
        }

        const collection = await db.collection("meals");
        const results = await collection.find({
            name: { $regex: name, $options: "i" }
        }).toArray();

        res.status(200).send(results);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error searching meals");
    }
});

router.patch("/:id/last-eaten", async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id) };
        const updates = {
            $set: {
                lastEaten: new Date(req.body.lastEaten)
            }
        };

        console.log('Updating last eaten for dish:', req.params.id);
        console.log('Setting lastEaten to:', req.body.lastEaten);

        const collection = await db.collection("meals");
        const result = await collection.updateOne(query, updates);

        console.log('Update result:', result);

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Dish not found" });
        }

        res.status(200).json({
            message: "Last eaten date updated successfully",
            modifiedCount: result.modifiedCount
        });
    } catch (e) {
        console.error('Error updating last eaten date:', e);
        res.status(500).json({ message: "Error updating last eaten date", error: e.message });
    }
});

// get meal by id
router.get("/:id", async (req, res) => {
    try {
        const collection = await db.collection("meals");
        const query = { _id: new ObjectId(req.params.id) };
        const result = await collection.findOne(query);

        if (!result) {
            res.status(404).send("Meal not found");
        } else {
            res.status(200).send(result);
        }
    } catch (e) {
        console.error(e);
        res.status(500).send("Error fetching meal");
    }
});

// post new meal
router.post("/", async (req, res) => {
    try {
        const add = {
            name: req.body.name,
            cuisine: req.body.cuisine,
            ingredients: req.body.ingredients || [],
            preferences: req.body.preferences || [],
        };

        const collection = await db.collection("meals");
        const result = await collection.insertOne(add);

        res.status(201).send({ insertedId: result.insertedId });
    } catch (e) {
        console.error(e);
        res.status(500).send("Error adding meal");
    }
});

// update last eaten
router.patch("/:id/last-eaten", async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id) };
        const newDate = new Date(req.body.lastEaten);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // end of today

        // only updating if the date is not in the future
        if (newDate > today) {
            console.log('Date is in the future, skipping update');
            return res.status(200).json({
                message: "Date is in the future, last eaten not updated",
                skipped: true
            });
        }

        const collection = db.collection("meals");
        const existingDoc = await collection.findOne(query);

        if (!existingDoc) {
            return res.status(404).json({ message: "Dish not found" });
        }

        // get current lastEaten that is not in the future
        const currentLastEaten = existingDoc.lastEaten ? new Date(existingDoc.lastEaten) : null;

        // only update if new date is more recent than current (but still not future)
        if (currentLastEaten && newDate <= currentLastEaten) {
            console.log('New date is not more recent than current lastEaten, skipping');
            return res.status(200).json({
                message: "New date is not more recent, last eaten not updated",
                currentLastEaten: currentLastEaten,
                proposedDate: newDate,
                skipped: true
            });
        }

        const updates = {
            $set: {
                lastEaten: newDate
            }
        };

        const result = await collection.updateOne(query, updates);

        res.status(200).json({
            message: "Last eaten date updated successfully",
            previousDate: currentLastEaten,
            newDate: newDate,
            modifiedCount: result.modifiedCount
        });
    } catch (e) {
        console.error('Error updating last eaten date:', e);
        res.status(500).json({ message: "Error updating last eaten date", error: e.message });
    }
});

// patch update meal
router.patch("/:id", async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id) };
        const updates = {
            $set: {
                name: req.body.name,
                cuisine: req.body.cuisine,
                ingredients: req.body.ingredients || [],
                preferences: req.body.preferences || [],
            },
        };

        const collection = await db.collection("meals");
        const result = await collection.updateOne(query, updates);

        res.status(200).send(result);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error updating meal");
    }
});

// delete meal
router.delete("/:id", async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id) };
        const collection = await db.collection("meals");
        const result = await collection.deleteOne(query);

        res.status(200).send(result);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error deleting meal");
    }
});

export default router;
