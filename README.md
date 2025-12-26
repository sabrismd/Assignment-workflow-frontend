Assignment Portal Backend
A Node.js/Express backend API for an Assignment Workflow Portal with JWT authentication, role-based access control, and MongoDB database.

✨ Features
RESTful API with Express.js

MongoDB with Mongoose ODM

JWT Authentication & Authorization

Role-based access control (Teacher/Student)

Assignment workflow management (Draft → Published → Completed)

Student submission system

Input validation with express-validator

CORS enabled

🚀 Quick Start
Prerequisites
Node.js (v16 or higher)

MongoDB (v4.4 or higher)

npm or yarn

Installation
Clone and navigate to backend

bash
cd Assignment_Workflow/backend
Install dependencies

bash
npm install
Configure environment variables
Create .env file in backend root:

env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/assignment_portal
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
Start MongoDB service

bash
# Windows (Run as Administrator)
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
Seed the database

bash
npm run seed
This creates:

1 Teacher account

3 Student accounts

Sample assignments

Test submissions

Start development server

bash
npm run dev
Server runs at: http://localhost:5000

📊 Database Schema
User Model
javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['teacher', 'student'],
  createdAt: Date
}
Assignment Model
javascript
{
  title: String,
  description: String,
  dueDate: Date,
  status: ['draft', 'published', 'completed'],
  createdBy: ObjectId (User),
  publishedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
Submission Model
javascript
{
  assignment: ObjectId (Assignment),
  student: ObjectId (User),
  answer: String,
  submittedAt: Date,
  reviewed: Boolean,
  reviewedAt: Date,
  feedback: String
}
🔌 API Endpoints
Authentication
POST /api/auth/register - Register new user

POST /api/auth/login - Login user

GET /api/auth/me - Get current user

Assignments
POST /api/assignments - Create assignment (Teacher only)

GET /api/assignments/teacher - Get teacher assignments

GET /api/assignments/student - Get student assignments

GET /api/assignments/:id - Get single assignment

PUT /api/assignments/:id - Update assignment

DELETE /api/assignments/:id - Delete assignment

PUT /api/assignments/:id/status - Update assignment status only

GET /api/assignments/:id/submissions - Get assignment submissions

Submissions
POST /api/submissions - Submit assignment (Student only)

GET /api/submissions/my - Get my submissions

GET /api/submissions/:id - Get single submission

PUT /api/submissions/:id - Update submission (review)

🔐 Authentication Flow
User logs in → Returns JWT token

Token stored in localStorage (frontend)

Subsequent requests include: Authorization: Bearer <token>

Protected routes verify token and role

🎭 Role-Based Access
Teacher Permissions
Create/edit/delete assignments

View all assignments (Draft/Published/Completed)

Publish assignments

Mark assignments as completed

View all student submissions

Review submissions and add feedback

Student Permissions
View only published assignments

Submit answers to assignments

View own submissions

Cannot edit submissions after sending

One submission per assignment

📝 Assignment Workflow
text
DRAFT → PUBLISHED → COMPLETED
Draft:

Created by teacher

Editable and deletable

Not visible to students

Published:

Visible to students

Students can submit answers

Cannot be deleted

Teacher can view submissions

Completed:

Locked (no changes)

No new submissions

All submissions finalized

⚙️ Available Scripts
bash
npm run dev      # Start development server
npm start        # Start production server
npm run seed     # Seed database with test data
🛠️ Development
File Structure
text
src/
├── config/          # Database configuration
├── controllers/     # Route controllers
├── middleware/      # Auth & role middleware
├── models/         # Mongoose models
├── routes/         # API routes
└── utils/          # Utility functions
Testing API
Use Postman or curl:

bash
# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@example.com","password":"password123"}'

# Get assignments (with token)
curl -X GET http://localhost:5000/api/assignments/teacher \
  -H "Authorization: Bearer YOUR_TOKEN"
🧪 Test Credentials
Teacher:

Email: teacher@example.com

Password: password123

Students:

Email: student1@example.com, student2@example.com, student3@example.com

Password: password123

🔧 Troubleshooting
Common Issues
MongoDB Connection Failed

bash
# Check if MongoDB is running
mongo --eval "db.adminCommand('ping')"

# Start MongoDB service
sudo service mongod start
Port Already in Use

bash
# Find process using port 5000
lsof -i :5000
kill -9 PID
JWT Errors

Clear browser localStorage

Check JWT_SECRET in .env

Restart server after .env changes

Reset Everything
bash
# Delete database
mongo assignment_portal --eval "db.dropDatabase()"

# Reseed
npm run seed

# Restart server
npm run dev
📦 Dependencies
Production:

express - Web framework

mongoose - MongoDB ODM

jsonwebtoken - JWT authentication

bcryptjs - Password hashing

cors - Cross-origin resource sharing

dotenv - Environment variables

express-validator - Input validation

Development:

nodemon - Auto-restart on changes

🚢 Deployment
Set production environment variables

env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=strong_production_secret
Install production dependencies

bash
npm install --production
Start server

bash
npm start
📄 License
MIT License - Educational Use
