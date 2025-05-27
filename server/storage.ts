import { 
  User, 
  InsertUser, 
  JobDescription, 
  InsertJobDescription,
  LeaveRequest,
  InsertLeaveRequest,
  Document,
  InsertDocument,
  PerformanceReview,
  InsertPerformanceReview,
  Message,
  InsertMessage,
  Task,
  InsertTask,
  Notification,
  InsertNotification,
  DepartmentStat,
  InsertDepartmentStat
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";
import * as schema from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getPendingUsers(): Promise<User[]>;
  approveUser(id: number, approverId: number): Promise<User | undefined>;
  rejectUser(id: number, approverId: number): Promise<boolean>;
  
  // Job Description methods
  getJobDescription(id: number): Promise<JobDescription | undefined>;
  getJobDescriptionByEmployee(employeeId: number): Promise<JobDescription | undefined>;
  createJobDescription(jobDescription: InsertJobDescription): Promise<JobDescription>;
  updateJobDescription(id: number, jobDescriptionData: Partial<InsertJobDescription>): Promise<JobDescription | undefined>;
  deleteJobDescription(id: number): Promise<boolean>;
  getAllJobDescriptions(): Promise<JobDescription[]>;
  
  // Leave Request methods
  getLeaveRequest(id: number): Promise<LeaveRequest | undefined>;
  getLeaveRequestsByEmployee(employeeId: number): Promise<LeaveRequest[]>;
  getLeaveRequestsByApprover(approverId: number): Promise<LeaveRequest[]>;
  createLeaveRequest(leaveRequest: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequest(id: number, leaveRequestData: Partial<LeaveRequest>): Promise<LeaveRequest | undefined>;
  approveLeaveRequest(id: number, approverId: number, approverNote?: string): Promise<LeaveRequest | undefined>;
  rejectLeaveRequest(id: number, approverId: number, approverNote: string): Promise<LeaveRequest | undefined>;
  deleteLeaveRequest(id: number): Promise<boolean>;
  getAllLeaveRequests(): Promise<LeaveRequest[]>;
  
  // Document methods
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByUploader(uploadedById: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, documentData: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  getAllDocuments(): Promise<Document[]>;
  
  // Performance Review methods
  getPerformanceReview(id: number): Promise<PerformanceReview | undefined>;
  getPerformanceReviewsByEmployee(employeeId: number): Promise<PerformanceReview[]>;
  getPerformanceReviewsByReviewer(reviewerId: number): Promise<PerformanceReview[]>;
  createPerformanceReview(performanceReview: InsertPerformanceReview): Promise<PerformanceReview>;
  updatePerformanceReview(id: number, performanceReviewData: Partial<PerformanceReview>): Promise<PerformanceReview | undefined>;
  deletePerformanceReview(id: number): Promise<boolean>;
  getAllPerformanceReviews(): Promise<PerformanceReview[]>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesBySender(senderId: number): Promise<Message[]>;
  getMessagesByReceiver(receiverId: number): Promise<Message[]>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessage(id: number): Promise<boolean>;
  getAllMessages(): Promise<Message[]>;
  
  // Task methods
  getTask(id: number): Promise<Task | undefined>;
  getTasksByAssignee(assigneeId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, taskData: Partial<Task>): Promise<Task | undefined>;
  completeTask(id: number): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getAllTasks(): Promise<Task[]>;
  
  // Notification methods
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
  getAllNotifications(): Promise<Notification[]>;
  
  // Department Stats methods
  getDepartmentStat(department: string): Promise<DepartmentStat | undefined>;
  updateDepartmentStat(department: string, statData: Partial<DepartmentStat>): Promise<DepartmentStat | undefined>;
  getAllDepartmentStats(): Promise<DepartmentStat[]>;
  
  // Session store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'session'
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(schema.users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(schema.users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.users)
      .where(eq(schema.users.id, id))
      .returning({ id: schema.users.id });
    return result.length > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(schema.users);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));
    return user;
  }

  async getPendingUsers(): Promise<User[]> {
    return await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.role, 'employee')); // For now, treat all non-admin/manager as pending
  }

  async approveUser(id: number, approverId: number): Promise<User | undefined> {
    const [approvedUser] = await db
      .update(schema.users)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, id))
      .returning();
    
    // Create approval notification
    if (approvedUser) {
      await this.createNotification({
        userId: id,
        message: `Your account has been approved! Welcome to the HR platform.`,
        type: 'account_approved'
      });
    }
    
    return approvedUser;
  }

  async rejectUser(id: number, approverId: number): Promise<boolean> {
    const [rejectedUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    
    if (rejectedUser) {
      await this.createNotification({
        userId: id,
        message: `Your account registration has been declined.`,
        type: 'account_rejected'
      });
      
      // For now, just notify rather than delete
      return true;
    }
    
    return false;
  }

  // Job Description methods
  async getJobDescription(id: number): Promise<JobDescription | undefined> {
    const [jobDescription] = await db
      .select()
      .from(schema.jobDescriptions)
      .where(eq(schema.jobDescriptions.id, id));
    return jobDescription;
  }

  async getJobDescriptionByEmployee(employeeId: number): Promise<JobDescription | undefined> {
    const [jobDescription] = await db
      .select()
      .from(schema.jobDescriptions)
      .where(eq(schema.jobDescriptions.employeeId, employeeId));
    return jobDescription;
  }

  async createJobDescription(jobDescriptionData: InsertJobDescription): Promise<JobDescription> {
    const [jobDescription] = await db
      .insert(schema.jobDescriptions)
      .values(jobDescriptionData)
      .returning();
    return jobDescription;
  }

  async updateJobDescription(id: number, jobDescriptionData: Partial<InsertJobDescription>): Promise<JobDescription | undefined> {
    const [updatedJobDescription] = await db
      .update(schema.jobDescriptions)
      .set({
        ...jobDescriptionData,
        updatedAt: new Date(),
      })
      .where(eq(schema.jobDescriptions.id, id))
      .returning();
    return updatedJobDescription;
  }

  async deleteJobDescription(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.jobDescriptions)
      .where(eq(schema.jobDescriptions.id, id))
      .returning({ id: schema.jobDescriptions.id });
    return result.length > 0;
  }

  async getAllJobDescriptions(): Promise<JobDescription[]> {
    return await db.select().from(schema.jobDescriptions);
  }

  // Leave Request methods
  async getLeaveRequest(id: number): Promise<LeaveRequest | undefined> {
    const [leaveRequest] = await db
      .select()
      .from(schema.leaveRequests)
      .where(eq(schema.leaveRequests.id, id));
    return leaveRequest;
  }

  async getLeaveRequestsByEmployee(employeeId: number): Promise<LeaveRequest[]> {
    return await db
      .select()
      .from(schema.leaveRequests)
      .where(eq(schema.leaveRequests.employeeId, employeeId))
      .orderBy(desc(schema.leaveRequests.createdAt));
  }

  async getLeaveRequestsByApprover(approverId: number): Promise<LeaveRequest[]> {
    return await db
      .select()
      .from(schema.leaveRequests)
      .where(eq(schema.leaveRequests.approverId, approverId))
      .orderBy(desc(schema.leaveRequests.createdAt));
  }

  async createLeaveRequest(leaveRequestData: InsertLeaveRequest): Promise<LeaveRequest> {
    const [leaveRequest] = await db
      .insert(schema.leaveRequests)
      .values(leaveRequestData)
      .returning();
    return leaveRequest;
  }

  async updateLeaveRequest(id: number, leaveRequestData: Partial<LeaveRequest>): Promise<LeaveRequest | undefined> {
    const [updatedLeaveRequest] = await db
      .update(schema.leaveRequests)
      .set({
        ...leaveRequestData,
        updatedAt: new Date(),
      })
      .where(eq(schema.leaveRequests.id, id))
      .returning();
    return updatedLeaveRequest;
  }

  async approveLeaveRequest(id: number, approverId: number, approverNote?: string): Promise<LeaveRequest | undefined> {
    const [approvedLeaveRequest] = await db
      .update(schema.leaveRequests)
      .set({
        status: 'approved',
        approverId,
        approverNote,
        updatedAt: new Date(),
      })
      .where(eq(schema.leaveRequests.id, id))
      .returning();
    return approvedLeaveRequest;
  }

  async rejectLeaveRequest(id: number, approverId: number, approverNote: string): Promise<LeaveRequest | undefined> {
    const [rejectedLeaveRequest] = await db
      .update(schema.leaveRequests)
      .set({
        status: 'rejected',
        approverId,
        approverNote,
        updatedAt: new Date(),
      })
      .where(eq(schema.leaveRequests.id, id))
      .returning();
    return rejectedLeaveRequest;
  }

  async deleteLeaveRequest(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.leaveRequests)
      .where(eq(schema.leaveRequests.id, id))
      .returning({ id: schema.leaveRequests.id });
    return result.length > 0;
  }

  async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    return await db
      .select()
      .from(schema.leaveRequests)
      .orderBy(desc(schema.leaveRequests.createdAt));
  }

  // Document methods
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(schema.documents)
      .where(eq(schema.documents.id, id));
    return document;
  }

  async getDocumentsByUploader(uploadedById: number): Promise<Document[]> {
    return await db
      .select()
      .from(schema.documents)
      .where(eq(schema.documents.uploadedById, uploadedById))
      .orderBy(desc(schema.documents.updatedAt));
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(schema.documents)
      .values(documentData)
      .returning();
    return document;
  }

  async updateDocument(id: number, documentData: Partial<Document>): Promise<Document | undefined> {
    const [updatedDocument] = await db
      .update(schema.documents)
      .set({
        ...documentData,
        updatedAt: new Date(),
      })
      .where(eq(schema.documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.documents)
      .where(eq(schema.documents.id, id))
      .returning({ id: schema.documents.id });
    return result.length > 0;
  }

  async getAllDocuments(): Promise<Document[]> {
    return await db
      .select()
      .from(schema.documents)
      .orderBy(desc(schema.documents.updatedAt));
  }

  // Performance Review methods
  async getPerformanceReview(id: number): Promise<PerformanceReview | undefined> {
    const [review] = await db
      .select()
      .from(schema.performanceReviews)
      .where(eq(schema.performanceReviews.id, id));
    return review;
  }

  async getPerformanceReviewsByEmployee(employeeId: number): Promise<PerformanceReview[]> {
    return await db
      .select()
      .from(schema.performanceReviews)
      .where(eq(schema.performanceReviews.employeeId, employeeId))
      .orderBy(desc(schema.performanceReviews.updatedAt));
  }

  async getPerformanceReviewsByReviewer(reviewerId: number): Promise<PerformanceReview[]> {
    return await db
      .select()
      .from(schema.performanceReviews)
      .where(eq(schema.performanceReviews.reviewerId, reviewerId))
      .orderBy(desc(schema.performanceReviews.updatedAt));
  }

  async createPerformanceReview(reviewData: InsertPerformanceReview): Promise<PerformanceReview> {
    const [review] = await db
      .insert(schema.performanceReviews)
      .values(reviewData)
      .returning();
    return review;
  }

  async updatePerformanceReview(id: number, reviewData: Partial<PerformanceReview>): Promise<PerformanceReview | undefined> {
    const [updatedReview] = await db
      .update(schema.performanceReviews)
      .set({
        ...reviewData,
        updatedAt: new Date(),
      })
      .where(eq(schema.performanceReviews.id, id))
      .returning();
    return updatedReview;
  }

  async deletePerformanceReview(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.performanceReviews)
      .where(eq(schema.performanceReviews.id, id))
      .returning({ id: schema.performanceReviews.id });
    return result.length > 0;
  }

  async getAllPerformanceReviews(): Promise<PerformanceReview[]> {
    return await db
      .select()
      .from(schema.performanceReviews)
      .orderBy(desc(schema.performanceReviews.updatedAt));
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.id, id));
    return message;
  }

  async getMessagesBySender(senderId: number): Promise<Message[]> {
    return await db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.senderId, senderId))
      .orderBy(desc(schema.messages.createdAt));
  }

  async getMessagesByReceiver(receiverId: number): Promise<Message[]> {
    return await db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.receiverId, receiverId))
      .orderBy(desc(schema.messages.createdAt));
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const [updatedMessage] = await db
      .update(schema.messages)
      .set({
        status: 'read',
      })
      .where(eq(schema.messages.id, id))
      .returning();
    return updatedMessage;
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(schema.messages)
      .values(messageData)
      .returning();
    return message;
  }

  async deleteMessage(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.messages)
      .where(eq(schema.messages.id, id))
      .returning({ id: schema.messages.id });
    return result.length > 0;
  }

  async getAllMessages(): Promise<Message[]> {
    return await db
      .select()
      .from(schema.messages)
      .orderBy(desc(schema.messages.createdAt));
  }

  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.id, id));
    return task;
  }

  async getTasksByAssignee(assigneeId: number): Promise<Task[]> {
    return await db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.assigneeId, assigneeId))
      .orderBy(asc(schema.tasks.dueDate));
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(schema.tasks)
      .values(taskData)
      .returning();
    return task;
  }

  async updateTask(id: number, taskData: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(schema.tasks)
      .set({
        ...taskData,
        updatedAt: new Date(),
      })
      .where(eq(schema.tasks.id, id))
      .returning();
    return updatedTask;
  }

  async completeTask(id: number): Promise<Task | undefined> {
    const [completedTask] = await db
      .update(schema.tasks)
      .set({
        completed: true,
        updatedAt: new Date(),
      })
      .where(eq(schema.tasks.id, id))
      .returning();
    return completedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.tasks)
      .where(eq(schema.tasks.id, id))
      .returning({ id: schema.tasks.id });
    return result.length > 0;
  }

  async getAllTasks(): Promise<Task[]> {
    return await db
      .select()
      .from(schema.tasks)
      .orderBy(asc(schema.tasks.dueDate));
  }

  // Notification methods
  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.id, id));
    return notification;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, userId))
      .orderBy(desc(schema.notifications.createdAt));
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(schema.notifications)
      .values(notificationData)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [updatedNotification] = await db
      .update(schema.notifications)
      .set({
        isRead: true,
      })
      .where(eq(schema.notifications.id, id))
      .returning();
    return updatedNotification;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.notifications)
      .where(eq(schema.notifications.id, id))
      .returning({ id: schema.notifications.id });
    return result.length > 0;
  }

  async getAllNotifications(): Promise<Notification[]> {
    return await db
      .select()
      .from(schema.notifications)
      .orderBy(desc(schema.notifications.createdAt));
  }

  // Department Stats methods
  async getDepartmentStat(department: string): Promise<DepartmentStat | undefined> {
    const [stat] = await db
      .select()
      .from(schema.departmentStats)
      .where(eq(schema.departmentStats.department, department));
    return stat;
  }

  async updateDepartmentStat(department: string, statData: Partial<DepartmentStat>): Promise<DepartmentStat | undefined> {
    // Check if department stat exists
    const existingStat = await this.getDepartmentStat(department);
    
    if (existingStat) {
      // Update existing stat
      const [updatedStat] = await db
        .update(schema.departmentStats)
        .set({
          ...statData,
          updatedAt: new Date(),
        })
        .where(eq(schema.departmentStats.department, department))
        .returning();
      return updatedStat;
    } else {
      // Create new stat
      const [newStat] = await db
        .insert(schema.departmentStats)
        .values({
          department: department,
          headCount: statData.headCount || 0,
          openPositions: statData.openPositions || 0,
          attritionRate: statData.attritionRate || '0%',
          avgTenure: statData.avgTenure || '0 years',
        })
        .returning();
      return newStat;
    }
  }

  async getAllDepartmentStats(): Promise<DepartmentStat[]> {
    return await db
      .select()
      .from(schema.departmentStats);
  }
}

export const storage = new DatabaseStorage();
