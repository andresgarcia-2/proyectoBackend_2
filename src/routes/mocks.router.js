import { Router } from 'express';
import { generatePets } from '../mocks/pets.mock.js';
import { generateUsers } from '../mocks/users.mock.js';
import UserModel from '../models/user.model.js';
import PetModel from '../models/pet.model.js';

const router = Router();

router.get('/mockingpets', (req, res) => {
    try {
        const pets = generatePets(100);

        res.json({
            status: 'success',
            quantity: pets.length,
            payload: pets
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: 'Error al generar mascotas',
            details: error.message
        });
    }
});

router.get('/mockingusers', (req, res) => {
    try {
        const users = generateUsers(50);

        res.json({
            status: 'success',
            quantity: users.length,
            payload: users
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: 'Error al generar usuarios',
            details: error.message
        });
    }
});

router.post('/generateData', async (req, res) => {
    try {
        const { users = 0, pets = 0 } = req.body;

        if (isNaN(users) || isNaN(pets)) {
                    return res.status(400).json({
                        status: 'error',
                        error: 'Los valores deben ser numéricos'
                    });
                }
        
                if (parseInt(users) < 0 || parseInt(pets) < 0) {
                    return res.status(400).json({
                        status: 'error',
                        error: 'Los valores deben ser positivos'
                    });
                }
        
                if (parseInt(users) === 0 && parseInt(pets) === 0) {
                    return res.status(400).json({
                        status: 'error',
                        error: 'Debes indicar al menos un usuario o mascota a generar'
                    });
                }
        
                const results = {
                    usersInserted: 0,
                    petsInserted: 0
                };

                if (parseInt(users) > 0) {
                    const fakeUsers = generateUsers(parseInt(users));
                    const insertedUsers = await UserModel.insertMany(fakeUsers);
                    results.usersInserted = insertedUsers.length;
                }

                if (parseInt(pets) > 0) {
                    const fakePets = generatePets(parseInt(pets));
                    const insertedPets = await PetModel.insertMany(fakePets);
                    results.petsInserted = insertedPets.length;
                }

                res.status(201).json({
                    status: 'success',
                    message: 'Datos generados e insertados correctamente',
                    payload: results
                });
                
            } catch (error) {
                res.status(500).json({
                    status: 'error',
                    error: 'Error al generar datos',
                    details: error.message
                });
            }
        });
                
                export default router;


