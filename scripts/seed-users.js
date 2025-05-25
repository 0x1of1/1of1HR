import { db } from '../server/db.js';
import { users } from '../shared/schema.js';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function seedUsers() {
  try {
    console.log('Checking for existing users...');
    const existingUsers = await db.select({ count: sql`count(*)` }).from(users);
    const count = Number(existingUsers[0].count);
    
    if (count > 0) {
      console.log(`Database already has ${count} users. Skipping seed operation.`);
      return;
    }
    
    console.log('Seeding default users...');
    
    const defaultUsers = [
      {
        username: 'admin',
        password: await hashPassword('admin123'),
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: 'admin',
        department: 'hr',
        position: 'Administrator',
        hireDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'manager',
        password: await hashPassword('admin123'),
        firstName: 'Manager',
        lastName: 'User',
        email: 'manager@example.com',
        role: 'manager',
        department: 'engineering',
        position: 'Engineering Manager',
        hireDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'employee',
        password: await hashPassword('admin123'),
        firstName: 'Employee',
        lastName: 'User',
        email: 'employee@example.com',
        role: 'employee',
        department: 'sales',
        position: 'Sales Representative',
        hireDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.insert(users).values(defaultUsers);
    console.log('Successfully seeded default users!');
    
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seedUsers();