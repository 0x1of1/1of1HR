# Contributing to HR Management System

## Development Workflow

### Branch Strategy
We follow a feature-based branching model:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Individual feature development
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/hr-management-system.git
   cd hr-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Initialize database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Creating a Feature Branch

```bash
# Create and switch to new feature branch
git checkout -b feature/user-profile-enhancement

# Work on your feature
# Make commits with descriptive messages

# Push your branch
git push origin feature/user-profile-enhancement

# Create pull request on GitHub
```

### Commit Message Convention

Use conventional commits format:

```
type(scope): description

feat(auth): add password reset functionality
fix(documents): resolve file upload error
docs(readme): update installation instructions
refactor(storage): optimize database queries
test(auth): add login flow tests
```

### Code Standards

- Use TypeScript for type safety
- Follow existing code formatting
- Add JSDoc comments for functions
- Write descriptive variable names
- Keep components small and focused

### Testing

- Test authentication flows with all user roles
- Verify database operations work correctly
- Test file upload functionality
- Ensure proper error handling

### Pull Request Process

1. Ensure your branch is up to date with develop
2. Write clear PR description
3. Include screenshots for UI changes
4. Reference related issues
5. Request review from maintainers

### Database Changes

When modifying database schema:

1. Update `shared/schema.ts`
2. Run `npm run db:push` to apply changes
3. Update storage interface if needed
4. Test with existing data

### Security Guidelines

- Never commit sensitive data
- Use environment variables for secrets
- Validate all user inputs
- Implement proper error handling
- Follow authentication best practices