import { Express } from "express";
import { storage } from "../storage";
import { insertJobDescriptionSchema } from "@shared/schema";

export function registerJobDescriptionRoutes(app: Express) {
  // Get all job descriptions
  app.get("/api/job-descriptions", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      // For employees, only show their own job description
      // For managers, show job descriptions they created + their own
      // For admins, show all job descriptions
      if (req.user!.role === "employee") {
        const jobDesc = await storage.getJobDescriptionByEmployee(req.user!.id);
        res.json(jobDesc ? [jobDesc] : []);
      } else if (req.user!.role === "manager") {
        const allJobDescriptions = await storage.getAllJobDescriptions();
        const filteredJobDescriptions = allJobDescriptions.filter(
          jd => jd.createdById === req.user!.id || jd.employeeId === req.user!.id
        );
        res.json(filteredJobDescriptions);
      } else {
        // Admin gets all
        const jobDescriptions = await storage.getAllJobDescriptions();
        res.json(jobDescriptions);
      }
    } catch (error) {
      next(error);
    }
  });

  // Get job description by ID
  app.get("/api/job-descriptions/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job description ID" });
      }

      const jobDescription = await storage.getJobDescription(id);
      if (!jobDescription) {
        return res.status(404).json({ message: "Job description not found" });
      }

      // Check if user has permission to view this job description
      if (req.user!.role === "employee" && jobDescription.employeeId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to view this job description" });
      }

      if (req.user!.role === "manager" && 
          jobDescription.createdById !== req.user!.id && 
          jobDescription.employeeId !== req.user!.id) {
        // Check if the employee is one of the manager's direct reports
        const employee = await storage.getUser(jobDescription.employeeId);
        if (!employee || employee.managerId !== req.user!.id) {
          return res.status(403).json({ message: "Forbidden: You don't have permission to view this job description" });
        }
      }

      res.json(jobDescription);
    } catch (error) {
      next(error);
    }
  });

  // Create job description (manager or admin only)
  app.post("/api/job-descriptions", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user!.role !== "manager" && req.user!.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Only managers or admins can create job descriptions" });
    }
    
    try {
      // Validate request body
      const validationResult = insertJobDescriptionSchema.safeParse({
        ...req.body,
        createdById: req.user!.id
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid job description data", errors: validationResult.error.errors });
      }

      // Check if employee exists
      const employee = await storage.getUser(req.body.employeeId);
      if (!employee) {
        return res.status(400).json({ message: "Employee not found" });
      }

      // Managers can only create job descriptions for their direct reports
      if (req.user!.role === "manager" && employee.managerId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You can only create job descriptions for your direct reports" });
      }

      // Check if employee already has a job description
      const existingJobDesc = await storage.getJobDescriptionByEmployee(req.body.employeeId);
      if (existingJobDesc) {
        return res.status(400).json({ message: "Employee already has a job description" });
      }

      // Create job description
      const jobDescription = await storage.createJobDescription({
        employeeId: req.body.employeeId,
        title: req.body.title,
        description: req.body.description,
        responsibilities: req.body.responsibilities,
        requirements: req.body.requirements,
        createdById: req.user!.id
      });
      
      // Create notification for the employee
      await storage.createNotification({
        userId: req.body.employeeId,
        title: "New Job Description",
        content: `Your job description has been created or updated: ${req.body.title}`,
        link: `/job-descriptions/${jobDescription.id}`
      });
      
      res.status(201).json(jobDescription);
    } catch (error) {
      next(error);
    }
  });

  // Update job description (manager or admin only)
  app.patch("/api/job-descriptions/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user!.role !== "manager" && req.user!.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Only managers or admins can update job descriptions" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job description ID" });
      }

      const jobDescription = await storage.getJobDescription(id);
      if (!jobDescription) {
        return res.status(404).json({ message: "Job description not found" });
      }

      // Managers can only update job descriptions they created or for their direct reports
      if (req.user!.role === "manager" && jobDescription.createdById !== req.user!.id) {
        const employee = await storage.getUser(jobDescription.employeeId);
        if (!employee || employee.managerId !== req.user!.id) {
          return res.status(403).json({ message: "Forbidden: You don't have permission to update this job description" });
        }
      }

      // Validate request body
      const updateSchema = insertJobDescriptionSchema.partial();
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid job description data", errors: validationResult.error.errors });
      }

      // If employee ID is being changed, check if new employee exists and doesn't already have a job description
      if (req.body.employeeId && req.body.employeeId !== jobDescription.employeeId) {
        const newEmployee = await storage.getUser(req.body.employeeId);
        if (!newEmployee) {
          return res.status(400).json({ message: "Employee not found" });
        }

        // Managers can only assign job descriptions to their direct reports
        if (req.user!.role === "manager" && newEmployee.managerId !== req.user!.id) {
          return res.status(403).json({ message: "Forbidden: You can only assign job descriptions to your direct reports" });
        }

        // Check if new employee already has a job description
        const existingJobDesc = await storage.getJobDescriptionByEmployee(req.body.employeeId);
        if (existingJobDesc) {
          return res.status(400).json({ message: "Employee already has a job description" });
        }
      }

      // Update job description
      const updatedJobDescription = await storage.updateJobDescription(id, req.body);
      if (!updatedJobDescription) {
        return res.status(404).json({ message: "Job description not found" });
      }

      // Create notification for the employee
      await storage.createNotification({
        userId: updatedJobDescription.employeeId,
        title: "Job Description Updated",
        content: `Your job description has been updated: ${updatedJobDescription.title}`,
        link: `/job-descriptions/${updatedJobDescription.id}`
      });

      res.json(updatedJobDescription);
    } catch (error) {
      next(error);
    }
  });

  // Delete job description (manager or admin only)
  app.delete("/api/job-descriptions/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user!.role !== "manager" && req.user!.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Only managers or admins can delete job descriptions" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job description ID" });
      }

      const jobDescription = await storage.getJobDescription(id);
      if (!jobDescription) {
        return res.status(404).json({ message: "Job description not found" });
      }

      // Managers can only delete job descriptions they created or for their direct reports
      if (req.user!.role === "manager" && jobDescription.createdById !== req.user!.id) {
        const employee = await storage.getUser(jobDescription.employeeId);
        if (!employee || employee.managerId !== req.user!.id) {
          return res.status(403).json({ message: "Forbidden: You don't have permission to delete this job description" });
        }
      }

      const success = await storage.deleteJobDescription(id);
      if (!success) {
        return res.status(404).json({ message: "Job description not found" });
      }

      // Create notification for the employee
      await storage.createNotification({
        userId: jobDescription.employeeId,
        title: "Job Description Deleted",
        content: `Your job description has been deleted: ${jobDescription.title}`,
      });

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Get job description by employee ID
  app.get("/api/job-descriptions/employee/:employeeId", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const employeeId = parseInt(req.params.employeeId);
      if (isNaN(employeeId)) {
        return res.status(400).json({ message: "Invalid employee ID" });
      }

      // Check if user has permission to view this employee's job description
      if (req.user!.role === "employee" && employeeId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to view this job description" });
      }

      if (req.user!.role === "manager" && employeeId !== req.user!.id) {
        // Check if the employee is one of the manager's direct reports
        const employee = await storage.getUser(employeeId);
        if (!employee || employee.managerId !== req.user!.id) {
          return res.status(403).json({ message: "Forbidden: You don't have permission to view this job description" });
        }
      }

      const jobDescription = await storage.getJobDescriptionByEmployee(employeeId);
      if (!jobDescription) {
        return res.status(404).json({ message: "Job description not found" });
      }

      res.json(jobDescription);
    } catch (error) {
      next(error);
    }
  });
}
