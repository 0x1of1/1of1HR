import { db } from './db';
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

export async function seedTestUsers() {
  try {
    console.log('Checking for admin user...');
    const adminUser = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
    
    if (adminUser.length > 0) {
      console.log('Admin user already exists, skipping seed operation.');
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
    
    for (const user of defaultUsers) {
      await db.insert(users).values(user);
    }
    
    console.log('Successfully seeded default users!');
    
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}