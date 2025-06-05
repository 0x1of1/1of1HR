# HR Management System

A comprehensive Human Resources management platform built with modern web technologies, featuring role-based access control, approval workflows, and complete HR module integration.

## 🚀 Features

### Core Modules
- **User Management** - Role-based authentication with approval workflows
- **Employee Management** - Complete employee lifecycle management
- **Document Management** - Secure file upload, versioning, and sharing
- **Leave Requests** - Streamlined time-off request and approval system
- **Performance Reviews** - Employee evaluation and feedback system
- **Messaging System** - Internal communication platform
- **Job Descriptions** - Role definition and management
- **Analytics Dashboard** - Real-time HR metrics and insights

### Authentication & Security
- **Approval-Based Registration** - Secure onboarding with manager approval
- **Role-Based Access Control** - Admin, Manager, Employee, Customer Support roles
- **Session Management** - Secure authentication with PostgreSQL session store
- **Password Security** - Strong encryption with salt-based hashing

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **Styling**: Tailwind CSS + Shadcn/UI components
- **State Management**: TanStack React Query
- **File Upload**: Multer middleware

### System Architecture
```
┌─────────────────┐    HTTP/REST API    ┌─────────────────┐
│   React SPA     │ ◄─────────────────► │  Express Server │
│                 │                     │                 │
│ • Components    │                     │ • Routes        │
│ • Hooks         │                     │ • Middleware    │
│ • State Mgmt    │                     │ • Authentication│
└─────────────────┘                     └─────────────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │   PostgreSQL    │
                                        │                 │
                                        │ • User Data     │
                                        │ • HR Records    │
                                        │ • Sessions      │
                                        └─────────────────┘
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn package manager

### Environment Variables
Create a `.env` file with:
```env
DATABASE_URL=postgresql://user:password@host:port/database
SESSION_SECRET=your-session-secret-here
NODE_ENV=development
```

### Installation
```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

## 👥 Test Accounts

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| admin | admin123 | Admin | Full system access |
| manager | admin123 | Manager | Team management |
| employee | admin123 | Employee | Personal HR features |

## 📋 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### User Management
- `GET /api/pending-users` - Get pending registrations
- `POST /api/approve-user/:id` - Approve user registration
- `POST /api/reject-user/:id` - Reject user registration

### Core Modules
- `GET /api/employees` - List employees
- `GET /api/documents` - List documents
- `POST /api/documents` - Upload document
- `GET /api/leave-requests` - List leave requests
- `POST /api/leave-requests` - Submit leave request
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message

## 🔐 Role-Based Permissions

### Admin
- Full system access
- User approval for all roles
- System configuration
- All HR module access

### Manager
- Employee approval rights
- Team management
- Department analytics
- Performance review creation

### Employee
- Personal profile management
- Leave request submission
- Document access
- Internal messaging

## 📝 Usage Guide

### Registration Workflow
1. New users register with role selection
2. Application enters "Pending" status
3. Appropriate approvers receive notifications
4. Admin/Manager reviews and approves/rejects
5. User receives notification of decision

### Document Management
1. Upload files through the Documents module
2. Set document status (Draft/Published/Archived)
3. Version control automatically maintained
4. Role-based access controls apply

### Leave Request Process
1. Employee submits time-off request
2. Manager receives notification
3. Manager approves/rejects with notes
4. Employee receives decision notification
5. Request tracked in system

## 🔧 Development

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and helpers
├── server/                 # Express backend
│   ├── routes/             # API route handlers
│   ├── auth.ts             # Authentication logic
│   ├── storage.ts          # Database operations
│   └── db.ts               # Database connection
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Drizzle database schema
└── uploads/                # File upload directory
```

### Adding New Features
1. Define database schema in `shared/schema.ts`
2. Add storage methods to `server/storage.ts`
3. Create API routes in `server/routes/`
4. Build React components in `client/src/`
5. Implement routing and state management

## 📊 Database Schema

The system uses PostgreSQL with the following main tables:
- `users` - User accounts and profiles
- `job_descriptions` - Role definitions
- `leave_requests` - Time-off requests
- `documents` - File metadata
- `performance_reviews` - Employee evaluations
- `messages` - Internal communications
- `notifications` - System notifications
- `department_stats` - Analytics data

## 🚀 Deployment

The application is designed for deployment on modern cloud platforms:
- Frontend: Static hosting (Vercel, Netlify)
- Backend: Node.js hosting (Railway, Render)
- Database: Managed PostgreSQL (Neon, Supabase)

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions, please open an issue in the GitHub repository.