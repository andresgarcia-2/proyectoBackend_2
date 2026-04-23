import { faker } from '@faker-js/faker';

export const generatePet = () => {
    return {
        name: faker.animal.petName(),
        specie: faker.helpers.arrayElement([
            'dog', 'cat', 'rabbit', 'bird', 'hamster'
        ]),
        birthDate: faker.date.past({ years: 10 }),
        adopted: false,
        owner: null,
        image: faker.image.url()
    };
};

export const generatePets = (quantity = 100) => {
    return Array.from({ length: quantity }, generatePet);
};