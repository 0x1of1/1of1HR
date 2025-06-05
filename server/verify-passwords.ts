import { db } from './db';
import { users } from '../shared/schema';
import { scrypt } from 'crypto';
import { promisify } from 'util';
import { eq } from 'drizzle-orm';

const scryptAsync = promisify(scrypt);

async function verifyPassword(supplied: string, stored: string): Promise<boolean> {
  try {
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      console.error("Invalid stored password format");
      return false;
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return hashedBuf.equals(suppliedBuf);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}

async function testPasswords() {
  console.log('Testing password verification for all users...\n');
  
  const testUsers = ['admin', 'manager', 'employee'];
  const testPassword = 'admin123';
  
  for (const username of testUsers) {
    try {
      const user = await db.select().from(users).where(eq(users.username, username)).limit(1);
      
      if (user.length === 0) {
        console.log(`❌ User ${username} not found`);
        continue;
      }
      
      const userData = user[0];
      const isValid = await verifyPassword(testPassword, userData.password);
      
      console.log(`${isValid ? '✅' : '❌'} ${username}: ${isValid ? 'Password correct' : 'Password incorrect'}`);
      console.log(`   Role: ${userData.role}, Status: ${userData.status}`);
      console.log(`   Email: ${userData.email}\n`);
      
    } catch (error) {
      console.error(`Error testing ${username}:`, error);
    }
  }
}

testPasswords().catch(console.error);