const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAll = async (req, res) => {
  try {
    const result = await mongodb.getDatabase().db().collection('pets').aggregate([
      {
        $lookup: {
          from: 'veterinarians',
          localField: 'veterinarianId',
          foreignField: '_id',
          as: 'veterinarianDetails'
        }
      }
    ]).toArray();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve pets', error: error.message });
  }
};

const getSingle = async (req, res) => {
  try {
    const petId = new ObjectId(req.params.id);
    const result = await mongodb.getDatabase().db().collection('pets').aggregate([
      { $match: { _id: petId } },
      {
        $lookup: {
          from: 'veterinarians',
          localField: 'veterinarianId',
          foreignField: '_id',
          as: 'veterinarianDetails'
        }
      }
    ]).toArray();

    if (result.length > 0) {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(result[0]);
    } else {
      res.status(404).json({ message: 'Pet not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve pet', error: error.message });
  }
};

const createPet = async (req, res) => {
  try {
    const { name, age, breed, ownerName, appointmentDate, weight, medicalHistory, veterinarianId } = req.body;

    if (!name || !age || !breed || !ownerName || !appointmentDate || !weight || !medicalHistory) {
      return res.status(400).json({ message: 'Missing required fields for creating a pet.' });
    }

    const pet = {
      name, 
      age, 
      breed, 
      ownerName, 
      appointmentDate, 
      weight, 
      medicalHistory,
      veterinarianId: veterinarianId ? new ObjectId(veterinarianId) : null
    };

    const response = await mongodb.getDatabase().db().collection('pets').insertOne(pet);

    if (response.acknowledged) {
      res.status(201).json({ message: 'Pet created successfully', petId: response.insertedId });
    } else {
      res.status(500).json({ message: 'Some error occurred while inserting the pet' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to create pet', error: error.message });
  }
};

const updatePet = async (req, res) => {
  try {
    const petId = new ObjectId(req.params.id);
    const { name, age, breed, ownerName, appointmentDate, weight, medicalHistory, veterinarianId } = req.body;

    if (!name || !age || !breed || !ownerName || !appointmentDate || !weight || !medicalHistory) {
      return res.status(400).json({ message: 'Missing required fields for updating a pet.' });
    }

    const pet = {
      name, 
      age, 
      breed, 
      ownerName, 
      appointmentDate, 
      weight, 
      medicalHistory,
      veterinarianId: veterinarianId ? new ObjectId(veterinarianId) : null
    };

    const response = await mongodb.getDatabase().db().collection('pets').replaceOne({ _id: petId }, pet);

    if (response.modifiedCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Pet not found or no changes were made' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update pet', error: error.message });
  }
};

const deletePet = async (req, res) => {
  try {
    const petId = new ObjectId(req.params.id);
    const response = await mongodb.getDatabase().db().collection('pets').deleteOne({ _id: petId });

    if (response.deletedCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Pet not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete pet', error: error.message });
  }
};

module.exports = {
  getAll,
  getSingle,
  createPet,
  updatePet,
  deletePet
};