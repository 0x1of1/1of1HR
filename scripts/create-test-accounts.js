import { pool } from '../server/db.js';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function createTestAccounts() {
  try {
    console.log('Creating test accounts...');
    
    // Admin account
    const adminPassword = await hashPassword('admin123');
    await pool.query(`
      INSERT INTO users (username, password, first_name, last_name, email, role, department, position, created_at, updated_at)
      VALUES ('admin', $1, 'Admin', 'User', 'admin@hrms.com', 'admin', 'hr', 'HR Director', NOW(), NOW())
      ON CONFLICT (username) DO NOTHING
    `, [adminPassword]);
    
    // Manager account
    const managerPassword = await hashPassword('manager123');
    await pool.query(`
      INSERT INTO users (username, password, first_name, last_name, email, role, department, position, created_at, updated_at)
      VALUES ('manager', $1, 'Manager', 'User', 'manager@hrms.com', 'manager', 'engineering', 'Engineering Manager', NOW(), NOW())
      ON CONFLICT (username) DO NOTHING
    `, [managerPassword]);
    
    // Employee account
    const employeePassword = await hashPassword('employee123');
    await pool.query(`
      INSERT INTO users (username, password, first_name, last_name, email, role, department, position, created_at, updated_at)
      VALUES ('employee', $1, 'Employee', 'User', 'employee@hrms.com', 'employee', 'marketing', 'Marketing Specialist', NOW(), NOW())
      ON CONFLICT (username) DO NOTHING
    `, [employeePassword]);
    
    console.log('Test accounts created successfully!');
    console.log('You can now log in with:');
    console.log('- username: admin, password: admin123 (Admin role)');
    console.log('- username: manager, password: manager123 (Manager role)');
    console.log('- username: employee, password: employee123 (Employee role)');
    
  } catch (error) {
    console.error('Error creating test accounts:', error);
  } finally {
    await pool.end();
  }
}

createTestAccounts();