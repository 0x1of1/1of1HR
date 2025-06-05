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

async function fixAdminPassword() {
  console.log('Fixing admin user password...');
  
  try {
    const hashedPassword = await hashPassword('admin123');
    
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.username, 'admin'));
    
    console.log('Admin password updated successfully');
    
    // Verify the fix worked
    const adminUser = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
    console.log('Admin user found:', adminUser[0] ? 'Yes' : 'No');
    
  } catch (error) {
    console.error('Error fixing admin password:', error);
  }
}

fixAdminPassword().catch(console.error);