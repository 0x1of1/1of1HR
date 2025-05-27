import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'employee', 'customer_support']);
export const userStatusEnum = pgEnum('user_status', ['pending', 'approved', 'rejected', 'active']);
export const leaveRequestStatusEnum = pgEnum('leave_request_status', ['pending', 'approved', 'rejected']);
export const documentStatusEnum = pgEnum('document_status', ['draft', 'published', 'archived']);
export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high', 'urgent']);
export const messageStatusEnum = pgEnum('message_status', ['unread', 'read']);
export const departmentEnum = pgEnum('department', ['engineering', 'marketing', 'sales', 'product', 'hr', 'finance', 'other']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: userRoleEnum("role").notNull().default('employee'),
  status: userStatusEnum("status").notNull().default('pending'),
  department: departmentEnum("department").notNull(),
  position: text("position").notNull(),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  startDate: timestamp("start_date"),
  registrationMessage: text("registration_message"),
  approvedBy: integer("approved_by").references(() => users.id),
  avatarUrl: text("avatar_url"),
  managerId: integer("manager_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User relations
export const usersRelations = relations(users, ({ one, many }) => ({
  manager: one(users, {
    fields: [users.managerId],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [users.approvedBy],
    references: [users.id],
  }),
  employees: many(users, { relationName: "manager" }),
  approvedUsers: many(users, { relationName: "approver" }),
  jobDescription: one(jobDescriptions, {
    fields: [users.id],
    references: [jobDescriptions.employeeId],
  }),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  leaveRequests: many(leaveRequests, { relationName: "requestor" }),
  approvedLeaveRequests: many(leaveRequests, { relationName: "approver" }),
}));

// Job Descriptions table
export const jobDescriptions = pgTable("job_descriptions", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => users.id).unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  responsibilities: text("responsibilities").notNull(),
  requirements: text("requirements").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdById: integer("created_by_id").notNull().references(() => users.id),
});

export const jobDescriptionsRelations = relations(jobDescriptions, ({ one }) => ({
  employee: one(users, {
    fields: [jobDescriptions.employeeId],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [jobDescriptions.createdById],
    references: [users.id],
  }),
}));

// Leave Requests table
export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => users.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  reason: text("reason").notNull(),
  status: leaveRequestStatusEnum("status").notNull().default('pending'),
  approverId: integer("approver_id").references(() => users.id),
  approverNote: text("approver_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leaveRequestsRelations = relations(leaveRequests, ({ one }) => ({
  employee: one(users, {
    fields: [leaveRequests.employeeId],
    references: [users.id],
    relationName: "requestor",
  }),
  approver: one(users, {
    fields: [leaveRequests.approverId],
    references: [users.id],
    relationName: "approver",
  }),
}));

// Documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  status: documentStatusEnum("status").notNull().default('draft'),
  uploadedById: integer("uploaded_by_id").notNull().references(() => users.id),
  version: integer("version").notNull().default(1),
  previousVersionId: integer("previous_version_id").references(() => documents.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documentsRelations = relations(documents, ({ one, many }) => ({
  uploadedBy: one(users, {
    fields: [documents.uploadedById],
    references: [users.id],
  }),
  previousVersion: one(documents, {
    fields: [documents.previousVersionId],
    references: [documents.id],
  }),
  nextVersions: many(documents),
}));

// Performance Reviews table
export const performanceReviews = pgTable("performance_reviews", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => users.id),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id),
  reviewPeriod: text("review_period").notNull(),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  goals: text("goals").notNull(),
  status: text("status").notNull().default('draft'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const performanceReviewsRelations = relations(performanceReviews, ({ one }) => ({
  employee: one(users, {
    fields: [performanceReviews.employeeId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [performanceReviews.reviewerId],
    references: [users.id],
  }),
}));

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  status: messageStatusEnum("status").notNull().default('unread'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  dueDate: timestamp("due_date").notNull(),
  assigneeId: integer("assignee_id").notNull().references(() => users.id),
  priority: priorityEnum("priority").notNull().default('medium'),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
  }),
}));

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  link: text("link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Department Statistics table (for dashboard)
export const departmentStats = pgTable("department_stats", {
  id: serial("id").primaryKey(),
  department: departmentEnum("department").notNull().unique(),
  headCount: integer("head_count").notNull().default(0),
  openPositions: integer("open_positions").notNull().default(0),
  attritionRate: text("attrition_rate").notNull().default('0%'),
  avgTenure: text("avg_tenure").notNull().default('0 years'),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schema Validations
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  status: true,
  approvedBy: true,
  createdAt: true, 
  updatedAt: true
});

// Registration schema for new users (includes additional approval fields)
export const registrationSchema = createInsertSchema(users).omit({
  id: true,
  status: true,
  approvedBy: true,
  managerId: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true
});

export const insertJobDescriptionSchema = createInsertSchema(jobDescriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  status: true,
  approverId: true,
  approverNote: true,
  createdAt: true,
  updatedAt: true
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  version: true,
  previousVersionId: true,
  createdAt: true,
  updatedAt: true
});

export const insertPerformanceReviewSchema = createInsertSchema(performanceReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  status: true,
  createdAt: true
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  completed: true,
  createdAt: true,
  updatedAt: true
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  isRead: true,
  createdAt: true
});

export const insertDepartmentStatsSchema = createInsertSchema(departmentStats).omit({
  id: true,
  updatedAt: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegistrationData = z.infer<typeof registrationSchema>;
export type User = typeof users.$inferSelect;

export type InsertJobDescription = z.infer<typeof insertJobDescriptionSchema>;
export type JobDescription = typeof jobDescriptions.$inferSelect;

export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type LeaveRequest = typeof leaveRequests.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertPerformanceReview = z.infer<typeof insertPerformanceReviewSchema>;
export type PerformanceReview = typeof performanceReviews.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertDepartmentStat = z.infer<typeof insertDepartmentStatsSchema>;
export type DepartmentStat = typeof departmentStats.$inferSelect;

// Type for auth
export type LoginInput = Pick<InsertUser, "username" | "password">;
