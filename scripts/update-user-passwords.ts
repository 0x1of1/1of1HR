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

async function updateUserPasswords() {
  try {
    // Update passwords for existing users
    const usersToUpdate = ['manager', 'employee'];
    
    for (const username of usersToUpdate) {
      const newPassword = await hashPassword('admin123');
      
      // Update the password
      const result = await db.update(users)
        .set({ password: newPassword })
        .where(eq(users.username, username))
        .returning({ id: users.id, username: users.username });
      
      if (result.length > 0) {
        console.log(`Password updated for user: ${username}`);
      } else {
        console.log(`User not found: ${username}`);
      }
    }
    
    console.log('Password update completed');
    
  } catch (error) {
    console.error('Error updating passwords:', error);
  } finally {
    process.exit(0);
  }
}

updateUserPasswords();