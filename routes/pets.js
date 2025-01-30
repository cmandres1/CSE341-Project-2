const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authenticate.js'); // Auth middleware
const { validatePet } = require('../middleware/validate'); // Validation middleware
const petsController = require('../controllers/pets'); // Controller for pet actions


// Get all pets
router.get('/', petsController.getAll);

// Get a single pet by ID
router.get('/:id', petsController.getSingle);

// Create a new pet
router.post('/', isAuthenticated, validatePet,petsController.createPet); // Validate pet before creating

// Update a pet by ID
router.put('/:id', isAuthenticated, validatePet, petsController.updatePet); // Validate pet before updating

// Delete a pet by ID
router.delete('/:id', isAuthenticated, petsController.deletePet);

module.exports = router;
