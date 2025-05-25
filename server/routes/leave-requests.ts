import { Express } from "express";
import { storage } from "../storage";
import { insertLeaveRequestSchema } from "@shared/schema";

export function registerLeaveRequestRoutes(app: Express) {
  // Get all leave requests
  app.get("/api/leave-requests", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      // For employees, only show their own requests
      // For managers, show their employees' requests + their own
      // For admins, show all requests
      if (req.user!.role === "employee") {
        const requests = await storage.getLeaveRequestsByEmployee(req.user!.id);
        res.json(requests);
      } else if (req.user!.role === "manager") {
        // Get all employees managed by this manager
        const allUsers = await storage.getAllUsers();
        const managedEmployeeIds = allUsers
          .filter(u => u.managerId === req.user!.id)
          .map(u => u.id);
        
        // Get requests for all managed employees + manager's own requests
        let requests = await storage.getLeaveRequestsByEmployee(req.user!.id);
        
        for (const empId of managedEmployeeIds) {
          const empRequests = await storage.getLeaveRequestsByEmployee(empId);
          requests = [...requests, ...empRequests];
        }
        
        res.json(requests);
      } else {
        // Admin or other roles get all requests
        const requests = await storage.getAllLeaveRequests();
        res.json(requests);
      }
    } catch (error) {
      next(error);
    }
  });

  // Get leave request by ID
  app.get("/api/leave-requests/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid leave request ID" });
      }

      const request = await storage.getLeaveRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      // Check if user has permission to view this request
      if (req.user!.role === "employee" && request.employeeId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to view this leave request" });
      }

      if (req.user!.role === "manager") {
        // Check if user is the manager of the employee
        const employee = await storage.getUser(request.employeeId);
        if (employee?.managerId !== req.user!.id && request.employeeId !== req.user!.id) {
          return res.status(403).json({ message: "Forbidden: You don't have permission to view this leave request" });
        }
      }

      res.json(request);
    } catch (error) {
      next(error);
    }
  });

  // Create leave request
  app.post("/api/leave-requests", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      // Validate request body
      const validationResult = insertLeaveRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid leave request data", errors: validationResult.error.errors });
      }

      // Employees can only create leave requests for themselves
      if (req.user!.role === "employee" && req.body.employeeId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You can only create leave requests for yourself" });
      }

      // Create leave request
      const request = await storage.createLeaveRequest({
        ...req.body,
        employeeId: req.body.employeeId || req.user!.id
      });
      
      // Create notification for the manager
      const employee = await storage.getUser(request.employeeId);
      if (employee?.managerId) {
        await storage.createNotification({
          userId: employee.managerId,
          title: "New Leave Request",
          content: `${employee.firstName} ${employee.lastName} has requested leave from ${new Date(request.startDate).toLocaleDateString()} to ${new Date(request.endDate).toLocaleDateString()}.`,
          link: `/leave-requests/${request.id}`
        });
      }
      
      res.status(201).json(request);
    } catch (error) {
      next(error);
    }
  });

  // Update leave request
  app.put("/api/leave-requests/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid leave request ID" });
      }

      const request = await storage.getLeaveRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      // Employees can only update their own pending leave requests
      if (req.user!.role === "employee") {
        if (request.employeeId !== req.user!.id) {
          return res.status(403).json({ message: "Forbidden: You don't have permission to update this leave request" });
        }
        
        if (request.status !== "pending") {
          return res.status(400).json({ message: "Cannot update a leave request that has already been approved or rejected" });
        }
      }

      // Validate request body
      const updateSchema = insertLeaveRequestSchema.partial();
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid leave request data", errors: validationResult.error.errors });
      }

      // Update leave request
      const updatedRequest = await storage.updateLeaveRequest(id, req.body);
      if (!updatedRequest) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      res.json(updatedRequest);
    } catch (error) {
      next(error);
    }
  });

  // Delete leave request
  app.delete("/api/leave-requests/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid leave request ID" });
      }

      const request = await storage.getLeaveRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      // Employees can only delete their own pending leave requests
      if (req.user!.role === "employee") {
        if (request.employeeId !== req.user!.id) {
          return res.status(403).json({ message: "Forbidden: You don't have permission to delete this leave request" });
        }
        
        if (request.status !== "pending") {
          return res.status(400).json({ message: "Cannot delete a leave request that has already been approved or rejected" });
        }
      }

      const success = await storage.deleteLeaveRequest(id);
      if (!success) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Approve leave request
  app.patch("/api/leave-requests/:id/approve", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user!.role !== "manager" && req.user!.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Only managers can approve leave requests" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid leave request ID" });
      }

      const request = await storage.getLeaveRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      // Check if manager is the manager of the employee
      if (req.user!.role === "manager") {
        const employee = await storage.getUser(request.employeeId);
        if (employee?.managerId !== req.user!.id) {
          return res.status(403).json({ message: "Forbidden: You don't have permission to approve this leave request" });
        }
      }

      // Approve leave request
      const approvedRequest = await storage.approveLeaveRequest(id, req.user!.id, req.body.note);
      if (!approvedRequest) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      // Create notification for the employee
      await storage.createNotification({
        userId: approvedRequest.employeeId,
        title: "Leave Request Approved",
        content: `Your leave request from ${new Date(approvedRequest.startDate).toLocaleDateString()} to ${new Date(approvedRequest.endDate).toLocaleDateString()} has been approved.`,
        link: `/leave-requests/${approvedRequest.id}`
      });

      res.json(approvedRequest);
    } catch (error) {
      next(error);
    }
  });

  // Reject leave request
  app.patch("/api/leave-requests/:id/reject", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user!.role !== "manager" && req.user!.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Only managers can reject leave requests" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid leave request ID" });
      }

      if (!req.body.note) {
        return res.status(400).json({ message: "A reason for rejection is required" });
      }

      const request = await storage.getLeaveRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      // Check if manager is the manager of the employee
      if (req.user!.role === "manager") {
        const employee = await storage.getUser(request.employeeId);
        if (employee?.managerId !== req.user!.id) {
          return res.status(403).json({ message: "Forbidden: You don't have permission to reject this leave request" });
        }
      }

      // Reject leave request
      const rejectedRequest = await storage.rejectLeaveRequest(id, req.user!.id, req.body.note);
      if (!rejectedRequest) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      // Create notification for the employee
      await storage.createNotification({
        userId: rejectedRequest.employeeId,
        title: "Leave Request Rejected",
        content: `Your leave request from ${new Date(rejectedRequest.startDate).toLocaleDateString()} to ${new Date(rejectedRequest.endDate).toLocaleDateString()} has been rejected.`,
        link: `/leave-requests/${rejectedRequest.id}`
      });

      res.json(rejectedRequest);
    } catch (error) {
      next(error);
    }
  });

  // Get leave requests by employee
  app.get("/api/leave-requests/employee/:employeeId", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const employeeId = parseInt(req.params.employeeId);
      if (isNaN(employeeId)) {
        return res.status(400).json({ message: "Invalid employee ID" });
      }

      // Employees can only view their own leave requests
      if (req.user!.role === "employee" && employeeId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to view these leave requests" });
      }

      // Managers can only view leave requests for their employees
      if (req.user!.role === "manager" && employeeId !== req.user!.id) {
        const employee = await storage.getUser(employeeId);
        if (employee?.managerId !== req.user!.id) {
          return res.status(403).json({ message: "Forbidden: You don't have permission to view these leave requests" });
        }
      }

      const requests = await storage.getLeaveRequestsByEmployee(employeeId);
      res.json(requests);
    } catch (error) {
      next(error);
    }
  });
}
