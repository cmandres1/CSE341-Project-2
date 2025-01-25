const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAll = async (req, res) => {
  //#swagger.tags = ['Veterinarians']
  try {
    const result = await mongodb.getDatabase().db().collection('veterinarians').find().toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve veterinarians', error: error.message });
  }
};

const getSingle = async (req, res) => {
  //#swagger.tags = ['Veterinarians']
  try {
    const vetId = new ObjectId(req.params.id);
    const result = await mongodb.getDatabase().db().collection('veterinarians').find({ _id: vetId }).toArray();

    if (result.length > 0) {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(result[0]);
    } else {
      res.status(404).json({ message: 'Veterinarian not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve veterinarian', error: error.message });
  }
};

const createVet = async (req, res) => {
  //#swagger.tags = ['Veterinarians']
  try {
    const { name, specialty, contactNumber, address } = req.body;

    if (!name || !specialty || !contactNumber || !address) {
      return res.status(400).json({ message: 'Missing required fields for creating a veterinarian.' });
    }

    const vet = { name, specialty, contactNumber, address };
    const response = await mongodb.getDatabase().db().collection('veterinarians').insertOne(vet);

    if (response.acknowledged) {
      res.status(201).json({ message: 'Veterinarian created successfully', vetId: response.insertedId });
    } else {
      res.status(500).json({ message: 'Some error occurred while inserting the veterinarian' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to create veterinarian', error: error.message });
  }
};

const updateVet = async (req, res) => {
  //#swagger.tags = ['Veterinarians']
  try {
    const vetId = new ObjectId(req.params.id);
    const { name, specialty, contactNumber, address } = req.body;

    if (!name || !specialty || !contactNumber || !address) {
      return res.status(400).json({ message: 'Missing required fields for updating a veterinarian.' });
    }

    const vet = { name, specialty, contactNumber, address };
    const response = await mongodb.getDatabase().db().collection('veterinarians').replaceOne({ _id: vetId }, vet);

    if (response.modifiedCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Veterinarian not found or no changes were made' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update veterinarian', error: error.message });
  }
};

const deleteVet = async (req, res) => {
  //#swagger.tags = ['Veterinarians']
  try {
    const vetId = new ObjectId(req.params.id);
    const response = await mongodb.getDatabase().db().collection('veterinarians').deleteOne({ _id: vetId });

    if (response.deletedCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Veterinarian not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete veterinarian', error: error.message });
  }
};

module.exports = {
  getAll,
  getSingle,
  createVet,
  updateVet,
  deleteVet
};