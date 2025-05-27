import { Express } from "express";
import { storage } from "../storage";
import { insertDocumentSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

export function registerDocumentRoutes(app: Express, upload: multer.Multer) {
  // Get all documents
  app.get("/api/documents", async (req, res, next) => {
    console.log('GET /api/documents - Auth status:', req.isAuthenticated());
    console.log('GET /api/documents - User:', req.user);
    
    try {
      let documents = await storage.getAllDocuments();
      
      // Don't filter for now - show all documents
      // if (req.user?.role !== "admin") {
      //   documents = documents.filter(doc => 
      //     doc.status === "published" || 
      //     doc.uploadedById === req.user!.id
      //   );
      // }
      
      res.json(documents);
    } catch (error) {
      next(error);
    }
  });

  // Get document by ID
  app.get("/api/documents/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Check if user has permission to view this document
      if (req.user!.role !== "admin" && 
          document.status !== "published" && 
          document.uploadedById !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to view this document" });
      }

      res.json(document);
    } catch (error) {
      next(error);
    }
  });

  // Upload document
  app.post("/api/documents", upload.single("file"), async (req, res, next) => {
    console.log('=== DOCUMENT UPLOAD DEBUG ===');
    console.log('Auth status:', req.isAuthenticated());
    console.log('User object:', req.user);
    console.log('Request body:', req.body);
    console.log('File object:', req.file);
    console.log('==============================');
    
    try {
      if (!req.file) {
        console.log('ERROR: No file uploaded');
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Get file metadata
      const fileUrl = `/uploads/${req.file.filename}`;
      const fileType = path.extname(req.file.originalname).slice(1).toLowerCase();
      
      // Use uploadedById from request body or default to user 1 for testing
      const uploadedById = parseInt(req.body.uploadedById) || req.user?.id || 1;
      
      console.log('Using uploadedById:', uploadedById);
      
      // Create document record
      const documentData = {
        title: req.body.title,
        description: req.body.description || "",
        fileUrl,
        fileType,
        status: req.body.status || "draft",
        uploadedById: uploadedById,
        version: 1, // Default version for new document
      };
      
      // Validate document data
      const validationResult = insertDocumentSchema.safeParse(documentData);
      if (!validationResult.success) {
        // Remove uploaded file if validation fails
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Invalid document data", errors: validationResult.error.errors });
      }

      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      // Remove uploaded file if an error occurs
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  });

  // Update document metadata
  app.patch("/api/documents/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Check if user has permission to update this document
      if (req.user!.role !== "admin" && document.uploadedById !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to update this document" });
      }

      // Validate update data
      const updateSchema = insertDocumentSchema.partial();
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid document data", errors: validationResult.error.errors });
      }

      // Update document
      const updatedDocument = await storage.updateDocument(id, req.body);
      if (!updatedDocument) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json(updatedDocument);
    } catch (error) {
      next(error);
    }
  });

  // Update document file (new version)
  app.put("/api/documents/:id/file", upload.single("file"), async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const document = await storage.getDocument(id);
      if (!document) {
        // Remove uploaded file if document not found
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: "Document not found" });
      }

      // Check if user has permission to update this document
      if (req.user!.role !== "admin" && document.uploadedById !== req.user!.id) {
        // Remove uploaded file if user doesn't have permission
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ message: "Forbidden: You don't have permission to update this document" });
      }

      // Get file metadata
      const fileUrl = `/uploads/${req.file.filename}`;
      const fileType = path.extname(req.file.originalname).slice(1).toLowerCase();
      
      // Create new document record (new version)
      const newDocumentData = {
        title: document.title,
        description: document.description,
        fileUrl,
        fileType,
        status: document.status,
        uploadedById: req.user!.id,
        version: document.version + 1,
        previousVersionId: document.id,
      };
      
      const newDocument = await storage.createDocument(newDocumentData);
      res.status(201).json(newDocument);
    } catch (error) {
      // Remove uploaded file if an error occurs
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  });

  // Delete document
  app.delete("/api/documents/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Check if user has permission to delete this document
      if (req.user!.role !== "admin" && document.uploadedById !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to delete this document" });
      }

      // Delete file
      if (document.fileUrl) {
        const filePath = path.join(process.cwd(), document.fileUrl.replace(/^\/uploads\//, 'uploads/'));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      const success = await storage.deleteDocument(id);
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Get documents by uploader
  app.get("/api/documents/uploader/:uploaderId", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const uploaderId = parseInt(req.params.uploaderId);
      if (isNaN(uploaderId)) {
        return res.status(400).json({ message: "Invalid uploader ID" });
      }

      // Regular employees can only view their own uploaded documents
      if (req.user!.role === "employee" && uploaderId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to view these documents" });
      }

      let documents = await storage.getDocumentsByUploader(uploaderId);
      
      // If not admin and not the uploader, filter documents based on status
      if (req.user!.role !== "admin" && uploaderId !== req.user!.id) {
        documents = documents.filter(doc => doc.status === "published");
      }
      
      res.json(documents);
    } catch (error) {
      next(error);
    }
  });

  // Get document versions
  app.get("/api/documents/:id/versions", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Check if user has permission to view this document
      if (req.user!.role !== "admin" && 
          document.status !== "published" && 
          document.uploadedById !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to view this document" });
      }

      // Get all versions of the document
      const allDocuments = await storage.getAllDocuments();
      
      // Start with the current document
      let versions = [document];
      let currentDoc = document;
      
      // Get all previous versions
      while (currentDoc.previousVersionId) {
        const prevDoc = allDocuments.find(d => d.id === currentDoc.previousVersionId);
        if (prevDoc) {
          versions.push(prevDoc);
          currentDoc = prevDoc;
        } else {
          break;
        }
      }
      
      // Get all next versions
      currentDoc = document;
      const nextVersions = allDocuments.filter(d => d.previousVersionId === currentDoc.id);
      versions = [...versions, ...nextVersions];
      
      // Sort by version number
      versions.sort((a, b) => b.version - a.version);
      
      res.json(versions);
    } catch (error) {
      next(error);
    }
  });
}
