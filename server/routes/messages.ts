import { Express } from "express";
import { storage } from "../storage";
import { insertMessageSchema } from "@shared/schema";

export function registerMessageRoutes(app: Express) {
  // Get all messages for current user (inbox and sent)
  app.get("/api/messages", async (req, res, next) => {
    // Allow access for all user roles - admin, manager, employee
    const userRole = req.user?.role || 'employee';
    const userId = req.user?.id || 1;
    console.log(`Messages access for ${userRole} (ID: ${userId})`);
    
    try {
      const userId = req.user!.id;
      
      // Get both received and sent messages
      const receivedMessages = await storage.getMessagesByReceiver(userId);
      const sentMessages = await storage.getMessagesBySender(userId);
      
      const messages = [...receivedMessages, ...sentMessages];
      
      // Sort by created date (newest first)
      messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });

  // Get message by ID
  app.get("/api/messages/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }

      const message = await storage.getMessage(id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      // Check if user has permission to view this message
      if (message.senderId !== req.user!.id && message.receiverId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to view this message" });
      }

      // If user is the receiver and message is unread, mark as read
      if (message.receiverId === req.user!.id && message.status === "unread") {
        await storage.markMessageAsRead(id);
      }

      res.json(message);
    } catch (error) {
      next(error);
    }
  });

  // Send a message
  app.post("/api/messages", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      // Validate request body
      const validationResult = insertMessageSchema.safeParse({
        ...req.body,
        senderId: req.user!.id
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid message data", errors: validationResult.error.errors });
      }

      // Check if receiver exists
      const receiver = await storage.getUser(req.body.receiverId);
      if (!receiver) {
        return res.status(400).json({ message: "Receiver not found" });
      }

      // Create message
      const message = await storage.createMessage({
        senderId: req.user!.id,
        receiverId: req.body.receiverId,
        subject: req.body.subject,
        content: req.body.content
      });
      
      // Create notification for the receiver
      await storage.createNotification({
        userId: req.body.receiverId,
        title: "New Message",
        content: `You have a new message from ${req.user!.firstName} ${req.user!.lastName}: ${req.body.subject}`,
        link: `/messages/${message.id}`
      });
      
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  });

  // Mark message as read
  app.patch("/api/messages/:id/read", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }

      const message = await storage.getMessage(id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      // Check if user is the receiver
      if (message.receiverId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to mark this message as read" });
      }

      const updatedMessage = await storage.markMessageAsRead(id);
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }

      res.json(updatedMessage);
    } catch (error) {
      next(error);
    }
  });

  // Delete message
  app.delete("/api/messages/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }

      const message = await storage.getMessage(id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      // Check if user has permission to delete this message
      if (message.senderId !== req.user!.id && message.receiverId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to delete this message" });
      }

      const success = await storage.deleteMessage(id);
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Get inbox messages
  app.get("/api/messages/inbox", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const userId = req.user!.id;
      const messages = await storage.getMessagesByReceiver(userId);
      
      // Sort by created date (newest first)
      messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });

  // Get sent messages
  app.get("/api/messages/sent", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const userId = req.user!.id;
      const messages = await storage.getMessagesBySender(userId);
      
      // Sort by created date (newest first)
      messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });

  // Get unread messages count
  app.get("/api/messages/unread/count", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const userId = req.user!.id;
      const messages = await storage.getMessagesByReceiver(userId);
      const unreadCount = messages.filter(m => m.status === "unread").length;
      
      res.json({ count: unreadCount });
    } catch (error) {
      next(error);
    }
  });
}
