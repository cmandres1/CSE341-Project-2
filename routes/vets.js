const express = require('express');
const router = express.Router();
const { validateVet } = require('../middleware/validate'); // Validation middleware
const vetsController = require('../controllers/vets'); // Controller for vet actions

// Get all veterinarians
router.get('/', vetsController.getAll);

// Get a single veterinarian by ID
router.get('/:id', vetsController.getSingle);

// Create a new veterinarian
router.post('/', validateVet, vetsController.createVet); // Validate vet before creating

// Update a veterinarian by ID
router.put('/:id', validateVet, vetsController.updateVet); // Validate vet before updating

// Delete a veterinarian by ID
router.delete('/:id', vetsController.deleteVet);

module.exports = router;