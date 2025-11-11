# Financial Literacy Cases Platform

A platform for collecting, organizing, and sharing real-world financial literacy cases for school education. This project bridges the gap between theoretical financial education and practical knowledge by partnering with banks and financial organizations.

## Features

- **Case Management**: Upload and organize financial literacy cases (PDF/TEX files)
- **Smart Search**: Filter cases by topic tags and search by keywords
- **Partner Showcase**: Display partner organizations supporting financial education
- **Social Sharing**: One-click sharing to Facebook, Twitter, LinkedIn, and Telegram
- **Admin Panel**: Secure admin interface for managing cases and organizations
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Technology Stack

- **Backend**: Node.js with Express
- **Database**: SQLite (easy to upgrade to PostgreSQL for production)
- **File Storage**: Local file system (can be upgraded to cloud storage)
- **Frontend**: Vanilla JavaScript with modern CSS
- **Authentication**: Session-based admin authentication

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd D:\Projects\fl_task_db
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Or for production:
   ```bash
   npm start
   ```

4. **Access the application:**
   - Landing page: http://localhost:3000
   - Browse cases: http://localhost:3000/cases
   - Admin panel: http://localhost:3000/admin

## Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

**IMPORTANT**: Change these credentials in production!

## Project Structure

```
fl_task_db/
├── public/                 # Frontend files
│   ├── index.html         # Landing page
│   ├── cases.html         # Case browsing page
│   ├── admin.html         # Admin panel
│   └── styles.css         # Styling
├── routes/                 # API routes
│   ├── auth.js            # Authentication endpoints
│   ├── cases.js           # Case management endpoints
│   └── organizations.js   # Organization endpoints
├── uploads/               # Uploaded files (created automatically)
├── database.js            # Database initialization
├── server.js              # Express server setup
├── package.json           # Project dependencies
└── README.md              # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/status` - Check authentication status

### Cases
- `GET /api/cases` - Get all cases (with optional search and tag filters)
- `GET /api/cases/:id` - Get single case details
- `POST /api/cases` - Create new case (admin only, multipart/form-data)
- `PUT /api/cases/:id` - Update case (admin only, multipart/form-data)
- `DELETE /api/cases/:id` - Delete case (admin only)
- `GET /api/cases/meta/tags` - Get all tags

### Organizations
- `GET /api/organizations` - Get all organizations
- `GET /api/organizations/:id` - Get single organization
- `POST /api/organizations` - Create organization (admin only)
- `PUT /api/organizations/:id` - Update organization (admin only)
- `DELETE /api/organizations/:id` - Delete organization (admin only)

## Usage Guide

### For Administrators

1. **Login**
   - Navigate to `/admin`
   - Use admin credentials to login

2. **Add Partner Organizations**
   - Click "Manage Organizations"
   - Click "Add New Organization"
   - Fill in organization name, logo URL (optional), and description
   - Click "Save Organization"

3. **Add Cases**
   - Click "Manage Cases"
   - Click "Add New Case"
   - Fill in case details:
     - Name (required)
     - Description
     - Select partner organization
     - Upload PDF or TEX file (required)
     - Add topic tags (press Enter after each tag)
   - Click "Save Case"

4. **Edit/Delete Content**
   - Use the Edit/Delete buttons in the management tables

### For Teachers and Students

1. **Browse Cases**
   - Navigate to `/cases`
   - Use the search bar to find cases by keyword
   - Select topic tags to filter by subject
   - Click "View Details" to see full case information

2. **Download Cases**
   - Click the "Download" button on any case card
   - Or open the case details and download from there

3. **Share Cases**
   - Open case details
   - Use the social media buttons to share
   - Or copy the direct link

## Deployment on Railway

1. **Create a Railway account** at https://railway.app

2. **Install Railway CLI** (optional):
   ```bash
   npm install -g @railway/cli
   ```

3. **Deploy via GitHub:**
   - Push your code to a GitHub repository
   - Connect Railway to your GitHub account
   - Create a new project and select your repository
   - Railway will automatically detect Node.js and deploy

4. **Deploy via CLI:**
   ```bash
   railway login
   railway init
   railway up
   ```

5. **Environment Variables:**
   Set these in Railway dashboard:
   - `SESSION_SECRET`: A random secure string
   - `NODE_ENV`: `production`

6. **Database:**
   For production, consider using Railway's PostgreSQL addon and update `database.js`

## Customization

### Change Default Admin Password

Edit `database.js` lines 68-69, but better: add a proper admin management system in production.

### Add More File Types

Edit `routes/cases.js` line 25 to add more allowed file extensions.

### Change Styling

Edit `public/styles.css` to customize colors, fonts, and layout. CSS variables are defined at the top for easy theming.

### Add Email Notifications

Install `nodemailer` and add notification logic in case creation/update endpoints.

## Future Enhancements

- User registration for teachers with favorites/bookmarks
- Rating and review system for cases
- Advanced analytics dashboard
- Multi-language support
- Cloud file storage (AWS S3, Azure Blob)
- PDF preview in browser
- Export cases to different formats
- Email notifications for new cases
- Advanced search with full-text indexing

## Database Schema

### Tables

1. **admins**: Admin user accounts
2. **organizations**: Partner organizations
3. **tags**: Topic tags for categorization
4. **cases**: Financial literacy cases
5. **case_tags**: Many-to-many relationship between cases and tags

### Relationships

- Cases belong to Organizations (many-to-one)
- Cases have many Tags through case_tags (many-to-many)

## Security Considerations

For production deployment:

1. **Change default admin credentials**
2. **Set strong SESSION_SECRET** environment variable
3. **Enable HTTPS** (set `cookie: { secure: true }` in server.js)
4. **Add rate limiting** to prevent brute force attacks
5. **Validate and sanitize** all user inputs
6. **Add CSRF protection**
7. **Implement proper password policies**
8. **Regular security audits**

## Troubleshooting

### Port Already in Use
If port 3000 is busy, set a different port:
```bash
PORT=3001 npm start
```

### Database Issues
Delete `database.sqlite` to reset the database (will lose all data).

### File Upload Fails
Check that the `uploads/` directory exists and has write permissions.

### Can't Login
Ensure session middleware is working and cookies are enabled in your browser.

## Support

For issues or questions:
- Check the console for error messages
- Verify all dependencies are installed: `npm install`
- Ensure Node.js version is 14 or higher: `node --version`

## License

MIT License - Feel free to use this project for educational and commercial purposes.

## Contributing

This is a prototype for a social project. Contributions are welcome!

Areas for contribution:
- UI/UX improvements
- Additional features
- Bug fixes
- Documentation
- Translations

---

Built with passion for financial education
