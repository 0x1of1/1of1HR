import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { registerEmployeeRoutes } from "./routes/employees";
import { registerLeaveRequestRoutes } from "./routes/leave-requests";
import { registerDocumentRoutes } from "./routes/documents";
import { registerMessageRoutes } from "./routes/messages";
import { registerJobDescriptionRoutes } from "./routes/job-descriptions";
import { registerPerformanceReviewRoutes } from "./routes/performance-reviews";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { seedTestUsers } from "./seed";

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed default test users
  await seedTestUsers();
  
  // Setup multer for file uploads
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });

  const upload = multer({ storage });
  app.use("/uploads", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  });
  
  // Serve static files from uploads directory
  app.use("/uploads", express.static(uploadsDir));

  // Setup authentication
  setupAuth(app);

  // Register API routes
  registerEmployeeRoutes(app);
  registerLeaveRequestRoutes(app);
  registerDocumentRoutes(app, upload);
  registerMessageRoutes(app);
  registerJobDescriptionRoutes(app);
  registerPerformanceReviewRoutes(app);

  // Department stats endpoint
  app.get("/api/department-stats", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      // Get all department stats from storage
      try {
        const stats = await storage.getAllDepartmentStats();
        res.json(stats);
      } catch (err) {
        console.error("Department stats error:", err);
        res.json([]);
      }
    } catch (error) {
      next(error);
    }
  });

  // Dashboard tasks endpoint
  app.get("/api/tasks/pending", async (req, res, next) => {
    try {
      const userId = req.user?.id || 1;
      const userRole = req.user?.role || 'admin';
      
      const tasks = await storage.getAllTasks();
      const userTasks = tasks.filter(task => task.assigneeId === userId);
      const pendingTasks = userTasks.filter(task => task.status !== 'completed');
      
      res.json(pendingTasks);
    } catch (error) {
      console.error('Tasks error:', error);
      res.json([]);
    }
  });

  // Team members endpoint for dashboard
  app.get("/api/team-members", async (req, res, next) => {
    try {
      const userId = req.user?.id || 1;
      const userRole = req.user?.role || 'admin';
      
      const allUsers = await storage.getAllUsers();
      
      // Filter team members based on user role
      let teammates;
      if (userRole === 'admin') {
        // Admin sees all users
        teammates = allUsers.filter((u: any) => u.id !== userId);
      } else if (userRole === 'manager') {
        // Manager sees employees in their department
        teammates = allUsers.filter((u: any) => u.id !== userId && u.role === 'employee');
      } else {
        // Employee sees other employees
        teammates = allUsers.filter((u: any) => u.id !== userId && u.role === 'employee');
      }
      
      // Add status to team members
      const teammatesWithStatus = teammates.map((user: any) => ({
        ...user,
        status: Math.random() > 0.7 ? "offline" : Math.random() > 0.5 ? "away" : "online"
      }));
      
      res.json(teammatesWithStatus);
    } catch (error) {
      next(error);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
