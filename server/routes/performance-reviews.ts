import { Express } from "express";
import { storage } from "../storage";
import { insertPerformanceReviewSchema } from "@shared/schema";

export function registerPerformanceReviewRoutes(app: Express) {
  // Get all performance reviews
  app.get("/api/performance-reviews", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      // For employees, only show their own reviews
      // For managers, show reviews they created + reviews for their direct reports
      // For admins, show all reviews
      if (req.user!.role === "employee") {
        const reviews = await storage.getPerformanceReviewsByEmployee(req.user!.id);
        res.json(reviews);
      } else if (req.user!.role === "manager") {
        const reviewsByReviewer = await storage.getPerformanceReviewsByReviewer(req.user!.id);
        
        // Get all employees managed by this manager
        const allUsers = await storage.getAllUsers();
        const managedEmployeeIds = allUsers
          .filter(u => u.managerId === req.user!.id)
          .map(u => u.id);
        
        // Get reviews for all managed employees
        let reviews = [...reviewsByReviewer];
        
        for (const empId of managedEmployeeIds) {
          const empReviews = await storage.getPerformanceReviewsByEmployee(empId);
          reviews = [...reviews, ...empReviews];
        }
        
        // Remove duplicates
        const uniqueReviews = reviews.filter((review, index, self) =>
          index === self.findIndex((r) => r.id === review.id)
        );
        
        res.json(uniqueReviews);
      } else {
        // Admin gets all
        const reviews = await storage.getAllPerformanceReviews();
        res.json(reviews);
      }
    } catch (error) {
      next(error);
    }
  });

  // Get performance review by ID
  app.get("/api/performance-reviews/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid performance review ID" });
      }

      const review = await storage.getPerformanceReview(id);
      if (!review) {
        return res.status(404).json({ message: "Performance review not found" });
      }

      // Check if user has permission to view this review
      if (req.user!.role === "employee" && review.employeeId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to view this performance review" });
      }

      if (req.user!.role === "manager" && 
          review.reviewerId !== req.user!.id && 
          review.employeeId !== req.user!.id) {
        // Check if the employee is one of the manager's direct reports
        const employee = await storage.getUser(review.employeeId);
        if (!employee || employee.managerId !== req.user!.id) {
          return res.status(403).json({ message: "Forbidden: You don't have permission to view this performance review" });
        }
      }

      res.json(review);
    } catch (error) {
      next(error);
    }
  });

  // Create performance review (manager or admin only)
  app.post("/api/performance-reviews", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user!.role !== "manager" && req.user!.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Only managers or admins can create performance reviews" });
    }
    
    try {
      // Validate request body
      const validationResult = insertPerformanceReviewSchema.safeParse({
        ...req.body,
        reviewerId: req.user!.id
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid performance review data", errors: validationResult.error.errors });
      }

      // Check if employee exists
      const employee = await storage.getUser(req.body.employeeId);
      if (!employee) {
        return res.status(400).json({ message: "Employee not found" });
      }

      // Managers can only create performance reviews for their direct reports
      if (req.user!.role === "manager" && employee.managerId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You can only create performance reviews for your direct reports" });
      }

      // Create performance review
      const review = await storage.createPerformanceReview({
        employeeId: req.body.employeeId,
        reviewerId: req.user!.id,
        reviewPeriod: req.body.reviewPeriod,
        content: req.body.content,
        rating: req.body.rating,
        goals: req.body.goals,
        status: req.body.status
      });
      
      // If status is published, notify the employee
      if (review.status === "published") {
        await storage.createNotification({
          userId: review.employeeId,
          title: "New Performance Review",
          content: `A performance review for the period ${review.reviewPeriod} has been published for you.`,
          link: `/performance-reviews/${review.id}`
        });
      }
      
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  });

  // Update performance review
  app.patch("/api/performance-reviews/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid performance review ID" });
      }

      const review = await storage.getPerformanceReview(id);
      if (!review) {
        return res.status(404).json({ message: "Performance review not found" });
      }

      // Check permissions based on status and role
      if (req.user!.role === "employee") {
        // Employees can only acknowledge a published review
        if (review.employeeId !== req.user!.id) {
          return res.status(403).json({ message: "Forbidden: You don't have permission to update this performance review" });
        }
        
        if (review.status !== "published") {
          return res.status(400).json({ message: "You can only acknowledge a published review" });
        }
        
        if (Object.keys(req.body).length > 1 || !req.body.status || req.body.status !== "acknowledged") {
          return res.status(400).json({ message: "You can only change the status to acknowledged" });
        }
      } else if (req.user!.role === "manager") {
        // Managers can only update reviews they created or for their direct reports
        if (review.reviewerId !== req.user!.id) {
          const employee = await storage.getUser(review.employeeId);
          if (!employee || employee.managerId !== req.user!.id) {
            return res.status(403).json({ message: "Forbidden: You don't have permission to update this performance review" });
          }
        }
        
        // Managers can't update a review that has been acknowledged unless they're changing it to completed
        if (review.status === "acknowledged" && 
            req.body.status && 
            req.body.status !== "completed") {
          return res.status(400).json({ message: "You can only change an acknowledged review to completed" });
        }
      }

      // Validate request body
      const updateSchema = insertPerformanceReviewSchema.partial();
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid performance review data", errors: validationResult.error.errors });
      }

      // Update performance review
      const updatedReview = await storage.updatePerformanceReview(id, req.body);
      if (!updatedReview) {
        return res.status(404).json({ message: "Performance review not found" });
      }

      // Create notifications based on status changes
      if (req.body.status) {
        if (req.body.status === "published" && review.status !== "published") {
          // Notify employee that review is published
          await storage.createNotification({
            userId: review.employeeId,
            title: "Performance Review Published",
            content: `A performance review for the period ${review.reviewPeriod} has been published for you.`,
            link: `/performance-reviews/${review.id}`
          });
        } else if (req.body.status === "acknowledged" && review.status !== "acknowledged") {
          // Notify reviewer that review is acknowledged
          await storage.createNotification({
            userId: review.reviewerId,
            title: "Performance Review Acknowledged",
            content: `The performance review for ${updatedReview.reviewPeriod} has been acknowledged by the employee.`,
            link: `/performance-reviews/${review.id}`
          });
        } else if (req.body.status === "completed" && review.status !== "completed") {
          // Notify employee that review is completed
          await storage.createNotification({
            userId: review.employeeId,
            title: "Performance Review Completed",
            content: `Your performance review for ${review.reviewPeriod} has been marked as completed.`,
            link: `/performance-reviews/${review.id}`
          });
        }
      }

      res.json(updatedReview);
    } catch (error) {
      next(error);
    }
  });

  // Delete performance review (manager or admin only, only drafts)
  app.delete("/api/performance-reviews/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user!.role !== "manager" && req.user!.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Only managers or admins can delete performance reviews" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid performance review ID" });
      }

      const review = await storage.getPerformanceReview(id);
      if (!review) {
        return res.status(404).json({ message: "Performance review not found" });
      }

      // Only draft reviews can be deleted
      if (review.status !== "draft") {
        return res.status(400).json({ message: "Only draft reviews can be deleted" });
      }

      // Managers can only delete reviews they created
      if (req.user!.role === "manager" && review.reviewerId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to delete this performance review" });
      }

      const success = await storage.deletePerformanceReview(id);
      if (!success) {
        return res.status(404).json({ message: "Performance review not found" });
      }

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Get performance reviews by employee
  app.get("/api/performance-reviews/employee/:employeeId", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const employeeId = parseInt(req.params.employeeId);
      if (isNaN(employeeId)) {
        return res.status(400).json({ message: "Invalid employee ID" });
      }

      // Check if user has permission to view this employee's reviews
      if (req.user!.role === "employee" && employeeId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to view these performance reviews" });
      }

      if (req.user!.role === "manager" && employeeId !== req.user!.id) {
        // Check if the employee is one of the manager's direct reports
        const employee = await storage.getUser(employeeId);
        if (!employee || employee.managerId !== req.user!.id) {
          return res.status(403).json({ message: "Forbidden: You don't have permission to view these performance reviews" });
        }
      }

      const reviews = await storage.getPerformanceReviewsByEmployee(employeeId);
      
      // If employee is viewing, filter out draft reviews
      if (req.user!.role === "employee") {
        const filteredReviews = reviews.filter(r => r.status !== "draft");
        res.json(filteredReviews);
      } else {
        res.json(reviews);
      }
    } catch (error) {
      next(error);
    }
  });

  // Get performance reviews by reviewer
  app.get("/api/performance-reviews/reviewer/:reviewerId", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const reviewerId = parseInt(req.params.reviewerId);
      if (isNaN(reviewerId)) {
        return res.status(400).json({ message: "Invalid reviewer ID" });
      }

      // Users can only view reviews they created unless they're admin
      if (req.user!.role !== "admin" && reviewerId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to view these performance reviews" });
      }

      const reviews = await storage.getPerformanceReviewsByReviewer(reviewerId);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  });
}
