import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

export const generateUser = () => {
    const hashedPassword = bcrypt.hashSync('coder123', 10);

    return {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email().toLowerCase(),
        age: faker.number.int({ min: 18, max: 80 }),
        password: hashedPassword,
        role: faker.helpers.arrayElement(['user', 'admin']),
        isActive: true
    };
};

export const generateUsers = (quantity = 50) => {
    return Array.from({ length: quantity }, generateUser);
};