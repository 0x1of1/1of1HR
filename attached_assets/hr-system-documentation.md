# HR Management System Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Architecture](#3-project-architecture)
4. [Project Structure](#4-project-structure)
5. [Authentication System](#5-authentication-system)
6. [Role-Based Access Control](#6-role-based-access-control)
7. [UI Components](#7-ui-components)
8. [Dashboard Modules](#8-dashboard-modules)
9. [Theming System](#9-theming-system)
10. [User Workflows](#10-user-workflows)
11. [Code Organization](#11-code-organization)
12. [Future Development](#12-future-development)

## 1. Project Overview

The HR Management System is a comprehensive web application designed to streamline human resources operations. It provides role-specific dashboards for administrators, managers, and employees, with features tailored to each role's responsibilities.

### Key Features

- **Role-based dashboards** for administrators, managers, and employees
- **Authentication system** with secure login and session management
- **Interactive dashboard** with metrics, charts, and activity feeds
- **Employee management** with directory and organizational structure
- **Performance review** tracking and management
- **Recruitment pipeline** visualization and management
- **Time tracking** and attendance management
- **Payroll and salary** management
- **Light and dark mode** theming

## 2. Technology Stack

### Frontend Technologies

- **React 18**: JavaScript library for building user interfaces
- **Next.js 14**: React framework for server-rendered applications
- **TypeScript**: Typed superset of JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Reusable UI components built with Radix UI and Tailwind
- **Lucide React**: Icon library
- **Recharts**: Composable charting library for React

### Development Tools

- **ESLint**: JavaScript linting utility
- **Prettier**: Code formatter
- **next-themes**: Theme management for Next.js

## 3. Project Architecture

The HR Management System follows a component-based architecture with clear separation of concerns:

![System Architecture](images/hr-system-architecture.png)

### Data Flow

1. User authenticates through the login page
2. Authentication context manages user session
3. Role-based access control determines available features
4. Dashboard components render based on user role
5. API calls (to be implemented) would fetch data from backend services

### Backend Runtime (Laravel Sail with Nginx + PHP-FPM)

As of recent modifications (for debugging and potentially improved stability), the Laravel backend,
managed by Docker and Laravel Sail, has been configured to use Nginx as the web server and
PHP-FPM (PHP FastCGI Process Manager) for processing PHP requests. This setup replaces
the default Laravel Sail development configuration which uses `php artisan serve` (PHP's built-in web server).

This change provides a more robust, production-like environment for the backend, potentially
offering better performance and handling of concurrent requests compared to the built-in PHP server.

Key components of this modified backend runtime:

- **Nginx:** Handles incoming HTTP requests, serves static files (if any from Laravel's public directory),
  and forwards PHP requests to PHP-FPM.
- **PHP-FPM:** Manages a pool of PHP processes to execute the Laravel application code.
- **Supervisor:** Continues to manage the Nginx and PHP-FPM processes within the Docker container.

This setup is defined within the Docker-related files in the `1of1hr/vendor/laravel/sail/runtimes/8.4/` directory
(specifically the `Dockerfile`, `supervisord.conf`, `default.conf` for Nginx, and `php-fpm.conf`).

## 4. Project Structure

\`\`\`
hr-dashboard/
├── app/ # Next.js app directory
│ ├── dashboard/ # Dashboard pages
│ │ ├── page.tsx # Main dashboard page
│ │ └── layout.tsx # Dashboard layout
│ ├── login/ # Authentication pages
│ │ └── page.tsx # Login page
│ ├── layout.tsx # Root layout
│ └── page.tsx # Root page (redirects to dashboard/login)
├── components/ # Reusable UI components
│ ├── dashboard/ # Dashboard-specific components
│ │ ├── admin-dashboard.tsx
│ │ ├── manager-dashboard.tsx
│ │ ├── employee-dashboard.tsx
│ │ └── ... # Other dashboard components
│ ├── ui/ # shadcn/ui components
│ ├── app-sidebar.tsx # Application sidebar
│ ├── header.tsx # Application header
│ ├── mode-toggle.tsx # Theme toggle component
│ └── theme-provider.tsx # Theme provider component
├── contexts/ # React contexts
│ └── auth-context.tsx # Authentication context
├── lib/ # Utility functions
│ └── utils.ts # General utilities
└── public/ # Static assets
\`\`\`

## 5. Authentication System

The authentication system is implemented using React Context API to manage user sessions across the application.

![Authentication Flow](images/hrms-authentication-flow.png)

### Authentication Flow

1. User enters credentials on the login page
2. Credentials are validated against stored user records
3. On successful authentication, user information is stored in context and localStorage
4. Protected routes check authentication status before rendering
5. Unauthorized users are redirected to the login page

### User Accounts

The system includes three predefined user accounts for demonstration:

| Role     | Email              | Password     |
| -------- | ------------------ | ------------ |
| Admin    | admin@hrapp.com    | Admin123!    |
| Manager  | manager@hrapp.com  | Manager123!  |
| Employee | employee@hrapp.com | Employee123! |

## 6. Role-Based Access Control

The system implements role-based access control to restrict access to features based on user roles:

### Admin Role

- Full access to all system features
- Can approve manager and employee signup requests
- Can view company-wide metrics and reports
- Can manage all employees and departments

### Manager Role

- Access to team management features
- Can approve employee signup requests
- Can view team metrics and reports
- Can manage team members and performance reviews

### Employee Role

- Limited access to personal information
- Can view personal metrics and performance
- Can request time off and view attendance
- Can access training and development resources

## 7. UI Components

The UI is built using a component-based approach with shadcn/ui components as the foundation.

### Layout Components

- **SidebarProvider**: Manages sidebar state (expanded/collapsed)
- **Sidebar**: Main navigation sidebar with role-based menu items
- **Header**: Application header with notifications and user menu
- **ThemeProvider**: Manages light/dark theme preferences

### Form Components

- **Input**: Text input fields
- **Button**: Action buttons with various styles
- **Select**: Dropdown selection
- **Checkbox**: Toggle selection
- **RadioGroup**: Option selection
- **Switch**: Toggle control

### Data Display Components

- **Table**: Data tables with sorting and pagination
- **Card**: Content containers
- **Badge**: Status indicators
- **Avatar**: User profile images
- **Progress**: Progress indicators

### Navigation Components

- **Tabs**: Content organization
- **DropdownMenu**: Contextual actions
- **Breadcrumb**: Navigation hierarchy
- **Pagination**: Page navigation

## 8. Dashboard Modules

### Admin Dashboard

\`\`\`
┌─────────────────────────────────┐
│ Dashboard Header with Metrics │
├─────────────────────────────────┤
│ Pending Approvals │
├─────────────────────────────────┤
│ Dashboard Charts │
├─────────────────────────────────┤
│ ┌─────────┐ ┌────────┐ ┌─────┐ │
│ │ Activity │ │ Hires │ │ ... │ │
│ └─────────┘ └────────┘ └─────┘ │
├─────────────────────────────────┤
│ Quick Actions │
└─────────────────────────────────┘
\`\`\`

![Admin Dashboard](images/hr-admin-dashboard.png)

### Manager Dashboard

\`\`\`
┌─────────────────────────────────┐
│ Dashboard Header with Metrics │
├─────────────────────────────────┤
│ Pending Approvals (Employees) │
├─────────────────────────────────┤
│ Dashboard Charts │
├─────────────────────────────────┤
│ ┌─────────┐ ┌────────┐ ┌─────┐ │
│ │ Activity │ │ Hires │ │ ... │ │
│ └─────────┘ └────────┘ └─────┘ │
├─────────────────────────────────┤
│ Quick Actions │
└─────────────────────────────────┘
\`\`\`

### Employee Dashboard

\`\`\`
┌─────────────────────────────────┐
│ Dashboard Header with Metrics │
├─────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ │
│ │ Attendance │ │ Performance │ │
│ └─────────────┘ └─────────────┘ │
├─────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ │
│ │ Training │ │ Announcements│ │
│ └─────────────┘ └─────────────┘ │
├─────────────────────────────────┤
│ Quick Actions │
└─────────────────────────────────┘
\`\`\`

![Employee Dashboard](images/employee-dashboard-overview.png)

### Dashboard Components

- **DashboardHeader**: Header with metrics and tabs
- **DashboardCharts**: Data visualization components
- **PendingApprovals**: Approval requests for admin/manager
- **EmployeeActivity**: Recent employee activities
- **RecentHires**: New employee listings
- **UpcomingReviews**: Scheduled performance reviews
- **QuickActions**: Role-specific action buttons

## 9. Theming System

The application supports light and dark themes using the `next-themes` library and Tailwind CSS.

### Theme Toggle Component

\`\`\`tsx
export function ModeToggle() {
const { theme, setTheme } = useTheme()

return (
<DropdownMenu>
<DropdownMenuTrigger asChild>
<Button variant="outline" size="icon" className="relative">
<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 
                          transition-all dark:-rotate-90 dark:scale-0" />
<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 
                          transition-all dark:rotate-0 dark:scale-100" />
<span className="sr-only">Toggle theme</span>
</Button>
</DropdownMenuTrigger>
<DropdownMenuContent align="end">
<DropdownMenuItem onClick={() => setTheme("light")}>
<Sun className="mr-2 h-4 w-4" />
<span>Light</span>
</DropdownMenuItem>
<DropdownMenuItem onClick={() => setTheme("dark")}>
<Moon className="mr-2 h-4 w-4" />
<span>Dark</span>
</DropdownMenuItem>
</DropdownMenuContent>
</DropdownMenu>
)
}
\`\`\`

### Theme Implementation

The theme is implemented using Tailwind CSS with a combination of:

- CSS variables for theme colors
- Dark mode variant in Tailwind
- Theme provider for managing theme state
- Local storage for persisting theme preference

## 10. User Workflows

### Admin User Journey

1. Admin logs in with admin credentials
2. System displays admin dashboard with company-wide metrics
3. Admin can:
   - View and approve manager/employee signup requests
   - Access all HR modules
   - View company-wide reports and analytics
   - Manage all employees and departments

### Manager User Journey

1. Manager logs in with manager credentials
2. System displays manager dashboard with team metrics
3. Manager can:
   - View and approve employee signup requests
   - Manage team members
   - Schedule performance reviews
   - View team reports and analytics

### Employee User Journey

1. Employee logs in with employee credentials
2. System displays employee dashboard with personal metrics
3. Employee can:
   - View personal performance metrics
   - Track time and attendance
   - Request time off
   - Access training and development resources
   - View company announcements

## 11. Code Organization

### Component Structure

Components follow a consistent pattern:

\`\`\`typescript
// Component structure example
"use client" // For client components

import { useState } from "react"
import { ComponentDependency } from "library"
import { AnotherComponent } from "@/components/another-component"

interface ComponentProps {
prop1: string
prop2?: number
}

export function Component({ prop1, prop2 = 0 }: ComponentProps) {
const [state, setState] = useState(initialState)

// Component logic

return (

<div className="component-container">
{/_ Component JSX _/}
</div>
)
}
\`\`\`

### Naming Conventions

- **Files**: kebab-case (e.g., `employee-dashboard.tsx`)
- **Components**: PascalCase (e.g., `EmployeeDashboard`)
- **Functions**: camelCase (e.g., `handleSubmit`)
- **Interfaces/Types**: PascalCase (e.g., `EmployeeProps`)
- **Constants**: UPPER_SNAKE_CASE for global constants, camelCase for local constants

### Code Organization Principles

1. **Separation of Concerns**: Components are organized by functionality
2. **Component Composition**: Complex UIs are built from smaller, reusable components
3. **Context for Global State**: React Context API for global state management
4. **Props for Component Communication**: Props for parent-child communication
5. **Hooks for Stateful Logic**: React hooks for managing component state and side effects

## 12. Future Development

### Backend Integration

The frontend is designed to work with a RESTful or GraphQL API. Key integration points include:

- **Authentication**: Replace client-side auth with server authentication
- **Data Fetching**: Replace static data with API calls
- **Form Submissions**: Connect forms to API endpoints
- **Real-time Updates**: Add WebSocket connections for notifications

### Additional Features

- **Advanced Analytics**: More detailed reporting and analytics
- **Document Management**: Upload and manage HR documents
- **Workflow Automation**: Automated approval workflows
- **Mobile Application**: Native mobile experience
- **Integration with Third-party Services**: Calendar, email, etc.

### Performance Optimizations

- **Server-Side Rendering**: Optimize for initial load performance
- **Code Splitting**: Reduce bundle size for faster loading
- **Image Optimization**: Optimize images for faster loading
- **Caching Strategies**: Implement caching for frequently accessed data

---

This documentation provides a comprehensive overview of the HR Management System, its architecture, components, and workflows. It serves as a reference for understanding the current implementation and a guide for future development.
