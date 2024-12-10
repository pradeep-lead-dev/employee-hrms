const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/get-all-tables', async (req, res, next) => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(collection => collection.name);
        res.json({ data: collectionNames });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tables', error: error.message });
    }
});

router.get('/formdata/:formName', async (req, res, next) => {
    const { tableName, formName } = req.params;

    try {
        // Dynamically access the collection
        const collection = mongoose.connection.collection('forms');

        // Find a single document by its ID
        const result = await collection.findOne({ tableName: formName });

        if (!result) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.status(200).json({ message: 'Data fetched successfully', data: result });
    } catch (error) {
        res.status(500).json({ message: 'Error getting data', error: error.message });
    }
});

router.get('/formdata/:tableName/:id', async (req, res, next) => {
    const { tableName, id } = req.params;

    try {
        // Dynamically access the collection
        const collection = mongoose.connection.collection('forms');

        // Find a single document by its ID
        const formData = await collection.findOne({ tableName });
        let data;

        if (mongoose.Types.ObjectId.isValid(id)) {
            // Dynamically access the collection
            const collectionName = mongoose.connection.collection(tableName);
            // Find a single document by its ID
            data = await collectionName.findOne({ _id: new mongoose.Types.ObjectId(id) });
        }

        if (!formData) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.status(200).json({ message: 'Data fetched successfully', formData, data });
    } catch (error) {
        res.status(500).json({ message: 'Error getting data', error: error.message });
    }
});

router.get('/:tableName', async (req, res, next) => {
    const { tableName } = req.params;

    try {
        // Dynamically get the collection
        const collection = mongoose.connection.db.collection(tableName);

        // Fetch all documents from the collection
        const result = await collection.find({}).toArray();

        res.status(200).json({ message: 'Data fetched successfully', data: result });
    } catch (error) {
        res.status(500).json({ message: 'Error getting data', error: error.message });
    }
});

router.get('/:tableName/:id', async (req, res, next) => {
    const { tableName, id } = req.params;

    try {
        // Validate if ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        // Dynamically access the collection
        const collection = mongoose.connection.collection(tableName);

        // Find a single document by its ID
        const result = await collection.findOne({ _id: new mongoose.Types.ObjectId(id) });

        if (!result) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.status(200).json({ message: 'Data fetched successfully', data: result });
    } catch (error) {
        res.status(500).json({ message: 'Error getting data', error: error.message });
    }
});

// Route to dynamically insert data into a collection
router.post('/:tableName', async (req, res, next) => {
    const { tableName } = req.params;
    const data = req.body;

    try {
        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({ message: 'No data provided to insert' });
        }

        // Dynamically get or create the collection
        const collection = mongoose.connection.db.collection(tableName);

        // Insert the data
        const result = await collection.insertOne(data);

        res.status(201).json({ message: 'Data inserted successfully', insertedId: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: 'Error inserting data', error: error.message });
    }
});

router.put('/:tableName/:id', async (req, res, next) => {
    const { tableName, id } = req.params;
    const updateData = req.body;

    const { _id, ...requestBody } = updateData

    try {
        // Validate if ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        // Dynamically access the collection
        const collection = mongoose.connection.collection(tableName);

        // Update the document
        const result = await collection.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(id) }, // Filter
            { $set: requestBody }, // Update data
            { returnDocument: 'after' } // Return the updated document
        );

        if (!result) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.status(200).json({ message: tableName+' updated successfully', data: result });
    } catch (error) {
        res.status(500).json({ message: 'Error updating data', error: error.message });
    }
});

// DELETE request: Delete a document by ID
router.delete('/:tableName/:id', async (req, res, next) => {
    const { tableName, id } = req.params;

    try {
        // Validate if ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        // Dynamically access the collection
        const collection = mongoose.connection.collection(tableName);

        // Delete the document
        const result = await collection.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.status(200).json({ message: 'Data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting data', error: error.message });
    }
});

module.exports = router;