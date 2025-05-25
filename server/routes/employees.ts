import { Express } from "express";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

export function registerEmployeeRoutes(app: Express) {
  // Get all employees
  app.get("/api/employees", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const employees = await storage.getAllUsers();
      res.json(employees);
    } catch (error) {
      next(error);
    }
  });

  // Get employee by ID
  app.get("/api/employees/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid employee ID" });
      }

      const employee = await storage.getUser(id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json(employee);
    } catch (error) {
      next(error);
    }
  });

  // Create employee (admin only)
  app.post("/api/employees", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user!.role !== "admin") return res.status(403).json({ message: "Forbidden: Admin access required" });
    
    try {
      // Validate request body
      const validationResult = insertUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid employee data", errors: validationResult.error.errors });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create employee
      const employee = await storage.createUser(req.body);
      res.status(201).json(employee);
    } catch (error) {
      next(error);
    }
  });

  // Update employee
  app.put("/api/employees/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid employee ID" });
      }

      // Only admin or the employee themselves can update their profile
      if (req.user!.role !== "admin" && req.user!.id !== id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to update this employee" });
      }

      // Validate request body
      const updateSchema = insertUserSchema.partial();
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid employee data", errors: validationResult.error.errors });
      }

      // If username is being updated, check if it already exists
      if (req.body.username) {
        const existingUser = await storage.getUserByUsername(req.body.username);
        if (existingUser && existingUser.id !== id) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }

      // Update employee
      const updatedEmployee = await storage.updateUser(id, req.body);
      if (!updatedEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json(updatedEmployee);
    } catch (error) {
      next(error);
    }
  });

  // Delete employee (admin only)
  app.delete("/api/employees/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user!.role !== "admin") return res.status(403).json({ message: "Forbidden: Admin access required" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid employee ID" });
      }

      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Get employees by manager
  app.get("/api/employees/manager/:managerId", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const managerId = parseInt(req.params.managerId);
      if (isNaN(managerId)) {
        return res.status(400).json({ message: "Invalid manager ID" });
      }

      const allEmployees = await storage.getAllUsers();
      const employeesUnderManager = allEmployees.filter(emp => emp.managerId === managerId);
      
      res.json(employeesUnderManager);
    } catch (error) {
      next(error);
    }
  });

  // Get employees by department
  app.get("/api/employees/department/:department", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const department = req.params.department;
      
      const allEmployees = await storage.getAllUsers();
      const employeesInDepartment = allEmployees.filter(emp => emp.department === department);
      
      res.json(employeesInDepartment);
    } catch (error) {
      next(error);
    }
  });
}
