const express = require('express');
const router = express.Router();
const { validatePet } = require('../middleware/validate'); // Validation middleware
const petsController = require('../controllers/pets'); // Controller for pet actions

// Get all pets
router.get('/', petsController.getAll);

// Get a single pet by ID
router.get('/:id', petsController.getSingle);

// Create a new pet
router.post('/', validatePet, petsController.createPet); // Validate pet before creating

// Update a pet by ID
router.put('/:id', validatePet, petsController.updatePet); // Validate pet before updating

// Delete a pet by ID
router.delete('/:id', petsController.deletePet);

module.exports = router;
