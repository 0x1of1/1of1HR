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
        role: 'admin' as const,
        status: 'active' as const,
        department: 'hr' as const,
        position: 'Administrator',
        startDate: new Date(),
        phone: '+1-555-0101',
        emergencyContact: 'Admin Emergency',
        emergencyPhone: '+1-555-0102',
        registrationMessage: 'System administrator account'
      },
      {
        username: 'manager',
        password: await hashPassword('admin123'),
        firstName: 'Manager',
        lastName: 'User',
        email: 'manager@example.com',
        role: 'manager' as const,
        status: 'active' as const,
        department: 'engineering' as const,
        position: 'Engineering Manager',
        startDate: new Date(),
        phone: '+1-555-0201',
        emergencyContact: 'Manager Emergency',
        emergencyPhone: '+1-555-0202',
        registrationMessage: 'Team management responsibilities'
      },
      {
        username: 'employee',
        password: await hashPassword('admin123'),
        firstName: 'Employee',
        lastName: 'User',
        email: 'employee@example.com',
        role: 'employee' as const,
        status: 'active' as const,
        department: 'sales' as const,
        position: 'Sales Representative',
        startDate: new Date(),
        phone: '+1-555-0301',
        emergencyContactName: 'Employee Emergency',
        emergencyContactPhone: '+1-555-0302',
        accessReason: 'Standard employee access'
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