import { db } from '../server/db';
import { users } from '../shared/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { eq } from 'drizzle-orm';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedUsers() {
  try {
    // Check for each user and only create if they don't exist
    const testUsers = [
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
    
    for (const user of testUsers) {
      const existingUser = await db.select().from(users).where(eq(users.username, user.username));
      
      if (existingUser.length === 0) {
        await db.insert(users).values(user);
        console.log(`Created user: ${user.username}`);
      } else {
        console.log(`User ${user.username} already exists`);
      }
    }
    
    console.log('User seeding completed');
    
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    process.exit(0);
  }
}

seedUsers();