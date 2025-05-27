# HR Management System - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Feature Workflows](#feature-workflows)
7. [Implementation Status](#implementation-status)
8. [API Endpoints](#api-endpoints)
9. [Development Guidelines](#development-guidelines)

## Project Overview

The HR Management System is a comprehensive web application designed to streamline human resources operations with role-based access control and automated workflows.

### Key Objectives
- Digitize HR processes and reduce manual paperwork
- Provide role-specific dashboards and functionality
- Enable efficient communication between employees, managers, and administrators
- Automate approval workflows and notifications
- Maintain compliance through audit trails and document management

### Current Status
- **UI/UX**: Complete with responsive design and role-based layouts
- **Authentication**: Fully implemented with session management
- **Backend Infrastructure**: PostgreSQL database with Drizzle ORM
- **Workflows**: In development phase (Phase 1)

## Technology Stack

### Frontend
- **React 18**: Component-based UI framework
- **TypeScript**: Type-safe JavaScript development
- **Wouter**: Lightweight routing library
- **TanStack Query**: Data fetching and state management
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built accessible UI components
- **Chart.js**: Data visualization for reports
- **Lucide React**: Icon library

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **TypeScript**: Type-safe server development
- **Passport.js**: Authentication middleware
- **Express Session**: Session management
- **Multer**: File upload handling

### Database
- **PostgreSQL**: Primary database
- **Drizzle ORM**: Type-safe database operations
- **Neon Serverless**: Database hosting

### Development Tools
- **Vite**: Build tool and development server
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Architecture

### Application Structure
```
HR System
├── Frontend (React SPA)
│   ├── Authentication Layer
│   ├── Role-Based Routing
│   ├── Dashboard Components
│   └── Feature Modules
├── Backend (Express API)
│   ├── Authentication Service
│   ├── Authorization Middleware
│   ├── Business Logic Controllers
│   └── Data Access Layer
└── Database (PostgreSQL)
    ├── User Management
    ├── Organizational Data
    ├── Workflow Data
    └── Audit Logs
```

### Data Flow
1. User authentication through login
2. Role-based access control determines available features
3. Frontend makes API requests to backend
4. Backend validates permissions and processes requests
5. Database operations through Drizzle ORM
6. Real-time notifications through WebSocket connections (planned)

## Database Schema

### Core Tables

#### Users
```sql
- id: Primary key
- username: Unique identifier
- password: Hashed password
- firstName, lastName: Personal information
- email: Contact information
- role: ENUM (admin, manager, employee, customer_support)
- department: ENUM (hr, engineering, marketing, sales, product, finance, other)
- position: Job title
- managerId: References users.id (hierarchical structure)
- avatarUrl: Profile image
- createdAt, updatedAt: Timestamps
```

#### Messages
```sql
- id: Primary key
- senderId: References users.id
- receiverId: References users.id
- content: Message text
- status: ENUM (unread, read)
- createdAt: Timestamp
```

#### Leave Requests
```sql
- id: Primary key
- employeeId: References users.id
- type: Leave type (vacation, sick, personal)
- startDate, endDate: Leave period
- reason: Employee explanation
- status: ENUM (pending, approved, rejected)
- approverId: References users.id
- approverNote: Manager comments
- createdAt, updatedAt: Timestamps
```

#### Performance Reviews
```sql
- id: Primary key
- employeeId: References users.id
- reviewerId: References users.id
- period: Review period
- goals: Performance objectives
- feedback: Manager evaluation
- selfAssessment: Employee input
- rating: Numeric score
- status: Review state
- createdAt, updatedAt: Timestamps
```

#### Documents
```sql
- id: Primary key
- title: Document name
- description: Document summary
- fileUrl: Storage location
- fileType: MIME type
- uploadedById: References users.id
- status: ENUM (draft, published, archived)
- version: Version number
- previousVersionId: References documents.id
- createdAt, updatedAt: Timestamps
```

#### Job Descriptions
```sql
- id: Primary key
- employeeId: References users.id
- title: Job title
- description: Role responsibilities
- requirements: Qualifications needed
- department: Associated department
- createdAt, updatedAt: Timestamps
```

#### Tasks
```sql
- id: Primary key
- assigneeId: References users.id
- title: Task name
- description: Task details
- priority: ENUM (low, medium, high, urgent)
- status: Task state
- dueDate: Deadline
- completedAt: Completion timestamp
- createdAt, updatedAt: Timestamps
```

#### Notifications
```sql
- id: Primary key
- userId: References users.id
- type: Notification category
- title: Notification headline
- message: Notification content
- isRead: Read status
- relatedId: Reference to related entity
- createdAt: Timestamp
```

## User Roles & Permissions

### Admin
**Full System Access**
- Manage all users and departments
- Access all reports and analytics
- System configuration and settings
- Approve manager-level requests
- View company-wide data

### Manager
**Team Management**
- Manage direct reports
- Approve employee leave requests
- Conduct performance reviews
- View team analytics
- Create job descriptions

### Employee
**Personal Management**
- View personal information
- Submit leave requests
- Access personal performance data
- Communicate with team members
- View company announcements

### Customer Support
**Support Functions**
- Access to help desk features
- View user support requests
- Limited employee data access
- Communication tools

## Feature Workflows

### 1. Messaging System Workflow

#### Core Flow
1. **Send Message**
   ```
   Employee/Manager → Compose → Select Recipient → Send
   ↓
   System creates message record
   ↓
   Generate notification for recipient
   ↓
   Update message count in header
   ```

2. **Receive Message**
   ```
   Notification appears in header
   ↓
   User clicks to view messages
   ↓
   Message marked as read
   ↓
   Notification count updated
   ```

#### Technical Implementation
- Real-time notifications using WebSocket
- Message threading for conversations
- File attachment support
- Message search functionality
- Archive/delete capabilities

#### Business Rules
- All users can message within their hierarchy
- Employees can message their direct manager
- Managers can message their team and upper management
- Admins can message anyone
- Customer support has limited messaging scope

### 2. Leave Request Management Workflow

#### Employee Submission Flow
1. **Request Creation**
   ```
   Employee → Leave Request Form → Select Dates/Type → Submit
   ↓
   System validates leave balance
   ↓
   Create pending request record
   ↓
   Notify direct manager
   ```

2. **Manager Approval Flow**
   ```
   Manager receives notification
   ↓
   Review request details
   ↓
   Approve/Reject with comments
   ↓
   Update request status
   ↓
   Notify employee of decision
   ```

#### Automated Rules
- Sick leave: Auto-approve up to 3 days
- Vacation: Requires manager approval
- Emergency leave: Immediate notification to HR
- Overlapping requests: Flag conflicts

#### Business Logic
- Leave balance tracking per employee
- Blackout dates (company events, busy periods)
- Advance notice requirements
- Escalation to HR for long-term leave

### 3. Employee Management Workflow

#### Onboarding Process
1. **Admin Creates Employee**
   ```
   Admin → Add Employee Form → Assign Manager/Department
   ↓
   Generate temporary credentials
   ↓
   Send welcome email
   ↓
   Create default job description
   ```

2. **Employee Setup**
   ```
   Employee logs in with temp credentials
   ↓
   Forced password change
   ↓
   Complete profile information
   ↓
   Manager assignment confirmation
   ```

#### Role Changes
- Department transfers require admin approval
- Manager changes trigger notification workflows
- Role promotions update permission sets
- Termination process archives data

### 4. Performance Review Workflow

#### Annual Review Cycle
1. **Review Initiation**
   ```
   System triggers annual review period
   ↓
   Auto-create review records for all employees
   ↓
   Notify managers of pending reviews
   ```

2. **Review Process**
   ```
   Employee completes self-assessment
   ↓
   Manager completes evaluation
   ↓
   Goals setting for next period
   ↓
   Final review meeting
   ↓
   Manager submits final review
   ```

#### Quarterly Check-ins
- Lighter touch progress reviews
- Goal adjustment opportunities
- Early intervention for performance issues

### 5. Document Management Workflow

#### Document Lifecycle
1. **Upload Process**
   ```
   User uploads document
   ↓
   System scans for policy compliance
   ↓
   Assign access permissions
   ↓
   Notify relevant stakeholders
   ```

2. **Version Control**
   ```
   User uploads new version
   ↓
   Previous version archived
   ↓
   Update notifications sent
   ↓
   Audit trail maintained
   ```

#### Access Control
- Role-based document access
- Department-specific documents
- Confidential HR documents (admin only)
- Public company policies (all users)

### 6. Notification System Workflow

#### Notification Types
- **Immediate**: Critical actions requiring urgent attention
- **Daily Digest**: Summary of non-urgent items
- **Weekly Summary**: Performance metrics and updates

#### Delivery Channels
- In-app notifications (primary)
- Email notifications (configurable)
- Mobile push notifications (future)

#### Automation Rules
- Auto-escalation for overdue approvals
- Reminder notifications for pending tasks
- Welcome messages for new employees
- Birthday and anniversary notifications

## Implementation Status

### ✅ Completed Features
- User authentication and session management
- Role-based access control
- Dashboard with role-specific metrics
- Basic UI components for all modules
- Database schema and ORM setup
- Reports page with analytics charts
- Settings page with user preferences

### 🚧 In Progress (Phase 1)
- Messaging system backend implementation
- Leave request workflow
- Employee management CRUD operations
- Real-time notification system

### 📋 Planned (Phase 2)
- Performance review system
- Document management with file uploads
- Advanced reporting and analytics
- Mobile responsiveness improvements

### 🔮 Future (Phase 3)
- Calendar integration
- Email notifications
- Mobile application
- Advanced workflow automation
- Third-party integrations (Slack, Teams)

## API Endpoints

### Authentication
```
POST /api/register - User registration
POST /api/login - User login
POST /api/logout - User logout
GET /api/user - Get current user
```

### Employee Management
```
GET /api/employees - List all employees
GET /api/employees/:id - Get employee details
POST /api/employees - Create new employee
PUT /api/employees/:id - Update employee
DELETE /api/employees/:id - Delete employee
```

### Messages
```
GET /api/messages - Get user messages
POST /api/messages - Send new message
PUT /api/messages/:id/read - Mark message as read
DELETE /api/messages/:id - Delete message
```

### Leave Requests
```
GET /api/leave-requests - Get leave requests
POST /api/leave-requests - Submit leave request
PUT /api/leave-requests/:id/approve - Approve request
PUT /api/leave-requests/:id/reject - Reject request
```

### Performance Reviews
```
GET /api/performance-reviews - Get reviews
POST /api/performance-reviews - Create review
PUT /api/performance-reviews/:id - Update review
```

### Documents
```
GET /api/documents - List documents
POST /api/documents - Upload document
GET /api/documents/:id - Download document
PUT /api/documents/:id - Update document metadata
DELETE /api/documents/:id - Delete document
```

### Notifications
```
GET /api/notifications - Get user notifications
PUT /api/notifications/:id/read - Mark as read
DELETE /api/notifications/:id - Delete notification
```

## Development Guidelines

### Code Organization
- Feature-based folder structure
- Shared components in common directories
- Type definitions in shared schema
- Business logic separated from UI components

### Data Validation
- Zod schemas for all API inputs
- Frontend form validation
- Database constraints
- Role-based authorization checks

### Error Handling
- Consistent error response format
- User-friendly error messages
- Logging for debugging
- Graceful degradation

### Security Considerations
- Password hashing with bcrypt
- Session security
- Input sanitization
- SQL injection prevention
- File upload security

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- End-to-end tests for critical workflows
- Performance testing for scalability

### Deployment Considerations
- Environment configuration
- Database migrations
- File storage setup
- Monitoring and logging
- Backup strategies

---

*This documentation is maintained as the system evolves. Last updated: January 2025*