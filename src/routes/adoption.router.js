import { Router } from 'express';
import { generatePets } from '../mocks/pets.mock.js';
import PetModel from '../models/pet.model.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const pets = await PetModel.find().select('-__v');
        res.json({
            status: 'success',
            count: pets.length,
            data: pets
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener mascotas',
            error: error.message
        });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pet = await PetModel.findById(id);
        
        if (!pet) {
            return res.status(404).json({
                status: 'error',
                message: 'Mascota no encontrada'
            });
        }
        
        res.json({
            status: 'success',
            data: pet
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener la mascota',
            error: error.message
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, age, breed, weight, description, photo } = req.body;

        if (!name || !age || !breed) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Campos requeridos: name, age, breed'
                    });
                }
                
                if (isNaN(age) || age < 0) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'La edad debe ser un número positivo'
                    });
                }
                
                const newPet = new PetModel({
                    name,
                    age: parseInt(age),
                    breed,
                    weight,
                    description,
                    photo
                });
                
                const savedPet = await newPet.save();
                
                res.status(201).json({
                    status: 'success',
                    message: 'Mascota creada exitosamente',
                    data: savedPet
                });
            } catch (error) {
                res.status(500).json({
                    status: 'error',
                    message: 'Error al crear la mascota',
                    error: error.message
                });
            }
        });

        router.put('/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const updateData = req.body;

                delete updateData._id;
                        delete updateData.__v;
                        
                        const updatedPet = await PetModel.findByIdAndUpdate(
                            id,
                            updateData,
                            { new: true, runValidators: true }
                        );
                        
                        if (!updatedPet) {
                            return res.status(404).json({
                                status: 'error',
                                message: 'Mascota no encontrada'
                            });
                        }
                        
                        res.json({
                            status: 'success',
                            message: 'Mascota actualizada exitosamente',
                            data: updatedPet
                        });
                    } catch (error) {
                        res.status(500).json({
                            status: 'error',
                            message: 'Error al actualizar la mascota',
                            error: error.message
                        });
                    }
                });
                

                router.delete('/:id', async (req, res) => {
                    try {
                        const { id } = req.params;
                        const deletedPet = await PetModel.findByIdAndDelete(id);
                        
                        if (!deletedPet) {
                            return res.status(404).json({
                                status: 'error',
                                message: 'Mascota no encontrada'
                            });
                        }
                        
                        res.json({
                            status: 'success',
                            message: 'Mascota eliminada exitosamente'
                        });
                    } catch (error) {
                        res.status(500).json({
                            status: 'error',
                            message: 'Error al eliminar la mascota',
                            error: error.message
                        });
                    }
                });
                
                export default router;