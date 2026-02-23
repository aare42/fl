# FL Project - Claude Code Analysis

## Project Overview
Financial literacy cases platform for Ukrainian schools. Built with Node.js/Express, SQLite database, and Tailwind CSS frontend.

## Architecture
- **Backend**: Express.js server with SQLite database
- **Frontend**: Static HTML/CSS/JS with Tailwind CSS styling
- **Database**: SQLite stored at `/app/data/database.sqlite` in production
- **Deployment**: Railway with Nixpacks builder

## Key Files
- `server.js` - Main Express server
- `database.js` - SQLite database initialization and schema
- `routes/cases.js` - Cases API endpoints 
- `routes/auth.js` - Admin authentication
- `public/cases.html` - Main cases browsing interface
- `seed.js` - Database seeding script (adds sample data)

## API Endpoints
- `GET /api/cases` - List all cases with optional filtering
- `GET /api/cases/meta/tags` - Get all available tags
- `GET /api/cases/:id` - Get single case details
- `POST /api/cases` - Create new case (admin only)
- `PUT/DELETE /api/cases/:id` - Update/delete case (admin only)

## Database Schema
- `organizations` - Partner organizations (banks, etc.)
- `tags` - Categories for filtering cases
- `cases` - Main case records with file references
- `case_tags` - Many-to-many relationship
- `admins` - Admin user accounts

## Common Issues & Solutions

### Empty Database After Deployment
**Problem**: Railway deployments can lose SQLite data during forced rebuilds
**Solution**: Use `npm run seed` to populate with sample fictional Ukrainian financial cases
**Files**: `seed.js`, `package.json` (build script)

### File Uploads in Production  
**Problem**: Uploaded files stored in `/app/uploads` may not persist
**Solution**: Configure Railway persistent volume for `/app/data` directory
**Files**: `railway.json` configuration

## Development Commands
- `npm run dev` - Start with nodemon for development
- `npm run seed` - Populate database with fictional sample data
- `npm start` - Production server start

## Admin Access
- Default admin: `admin` / `admin123` (change in production)
- Admin panel: `/admin`
- Requires authentication for case management

## Deployment Notes
- Railway auto-deploys from GitHub main branch
- Build process runs `npm run seed` to ensure fictional sample data exists
- Database persists in `/app/data` volume mount
- Environment variables managed through Railway dashboard
- Uses fictional organization names until real partnerships are established