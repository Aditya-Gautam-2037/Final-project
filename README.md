# 🚀 QueryFlow - SQL Playground

A full-stack web application that provides an interactive SQL learning and testing environment with support for multiple databases, file uploads, and AI-powered query generation.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🔐 Authentication & User Management
- User registration and login with JWT authentication
- Protected routes with automatic token validation
- Session management with automatic logout on token expiry

### 📊 Multi-Database Support
- **SQLite**: Local file storage and database initialization (automatically created)
- **MySQL**: Primary database for SQL query execution (requires local/remote MySQL server)
- **MongoDB**: User authentication and query history storage (requires local/remote MongoDB)

### 🎯 Interactive SQL Editor
- Monaco Editor integration for enhanced code editing
- Syntax highlighting and auto-completion
- Real-time query execution with tabular result display
- Query history tracking and management

### 📁 File Upload & Processing
- CSV file upload with automatic table creation
- Image upload with AI-powered SQL generation (Python integration)
- File validation and secure storage

### 🎨 Modern UI/UX
- Responsive design with Bootstrap styling
- Dark/Light mode toggle
- Real-time notifications and loading states
- Sidebar navigation with table management

### 🔍 Database Management
- View all database tables in sidebar
- Table schema inspection
- Table deletion functionality
- Dynamic table information display

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Bootstrap 5** - UI components and styling
- **Monaco Editor** - Advanced code editor
- **Axios** - HTTP client for API calls
- **TailwindCSS** - Utility-first CSS framework

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for user data
- **SQLite3** - SQL database for query execution
- **MySQL2** - MySQL database connector
- **JWT** - JSON Web Token authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload middleware
- **Mongoose** - MongoDB object modeling

### Development Tools
- **Nodemon** - Development server with hot reload
- **ESLint** - Code linting and formatting
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or cloud instance) - **REQUIRED for user authentication**
- **MySQL** (local installation or remote server) - **REQUIRED for SQL query execution**
- **Python** (for image-to-SQL conversion feature)

### 🚨 **Important Database Setup Notes:**

**This application requires THREE databases to function properly:**

1. **SQLite** - ✅ Automatically created at `./uploads/database.db`
2. **MySQL** - ⚠️ **YOU MUST INSTALL AND CONFIGURE**
3. **MongoDB** - ⚠️ **YOU MUST INSTALL AND CONFIGURE**

**The app will NOT work without MySQL and MongoDB running!**

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/Aditya-Gautam-2037/Final-project.git
cd Final-project
```

### 2. Backend Setup
```bash
cd sql-playground-backend
npm install
```

### 3. Frontend Setup
```bash
cd ../sql-playground-frontend
npm install
```

### 4. Database Setup (REQUIRED)

#### MySQL Setup:
```bash
# Install MySQL (Ubuntu/Debian)
sudo apt update
sudo apt install mysql-server

# Start MySQL service
sudo service mysql start

# Access MySQL and create database
mysql -u root -p
CREATE DATABASE sql_playground;
GRANT ALL PRIVILEGES ON sql_playground.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### MongoDB Setup:
```bash
# Install MongoDB (Ubuntu/Debian)
sudo apt update
sudo apt install mongodb

# Start MongoDB service
sudo service mongodb start

# Verify MongoDB is running
sudo systemctl status mongodb
```

#### Alternative: Use Docker for Databases
```bash
# Run MySQL in Docker
docker run --name mysql-playground -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=sql_playground -p 3306:3306 -d mysql:latest

# Run MongoDB in Docker
docker run --name mongo-playground -p 27017:27017 -d mongo:latest
```

## ⚙️ Configuration

### Backend Environment Variables
Create a `.env` file in the `sql-playground-backend` directory:

```env
# Server Configuration
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/sql-playground

# MySQL Configuration (Optional)
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=sql_playground

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB in bytes
```

### Frontend Configuration
The frontend is configured to connect to the backend at `http://localhost:5000`. If you change the backend port, update the API calls in the frontend components.

## 🏃‍♂️ Usage

### 1. Start the Backend Server
```bash
cd sql-playground-backend
npm run dev
```

The backend will start on `http://localhost:5000` with the following status:
- ✅ SQLite database initialized
- ✅ MongoDB connection established
- ✅ Server running with hot reload

### 2. Start the Frontend Development Server
```bash
cd sql-playground-frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Access the Application
1. Open your browser and navigate to `http://localhost:5173`
2. Register a new account or login with existing credentials
3. Start writing and executing SQL queries!

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Query Management
- `POST /api/run-query` - Execute SQL query
- `POST /api/execute-sql` - Alternative query execution endpoint
- `GET /api/query-history` - Fetch user's query history
- `GET /api/all-queries` - Fetch all queries (admin)
- `DELETE /api/query-history/clear` - Clear query history

### Database Management
- `GET /api/tables` - Get all table names
- `GET /api/table-info/:tableName` - Get table schema information
- `DELETE /api/table/:tableName` - Drop a table

### File Upload
- `POST /api/upload` - File upload endpoint
- `POST /api/file-upload` - Alternative file upload

## 📁 Project Structure

```
Final-project/
├── sql-playground-backend/
│   ├── controllers/
│   │   ├── authController.js       # Authentication logic
│   │   ├── queryController.js      # SQL query handling
│   │   ├── fileUploadController.js # File upload logic
│   │   └── image_to_sql.py        # AI image processing
│   ├── middlewares/
│   │   └── authMiddleware.js       # JWT authentication middleware
│   ├── models/
│   │   ├── User.js                # User data model
│   │   └── QueryHistory.js        # Query history model
│   ├── routes/
│   │   ├── authRoutes.js          # Authentication routes
│   │   ├── queryRoutes.js         # Query execution routes
│   │   └── uploadRoutes.js        # File upload routes
│   ├── uploads/                   # File storage directory
│   ├── app.js                     # Main application file
│   ├── db.js                      # MySQL connection
│   ├── mongo.js                   # MongoDB connection
│   └── package.json               # Backend dependencies
│
└── sql-playground-frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.jsx       # Main dashboard component
    │   │   ├── Login.jsx          # Login component
    │   │   ├── Register.jsx       # Registration component
    │   │   ├── FileUpload.jsx     # File upload component
    │   │   ├── NavbarWithSidebar.jsx # Navigation component
    │   │   ├── ProtectedRoute.jsx # Route protection
    │   │   └── SQLDisplay.jsx     # SQL result display
    │   ├── utils/
    │   │   └── isTokenExpired.js  # JWT token validation
    │   ├── App.jsx                # Main App component
    │   ├── main.jsx              # Application entry point
    │   └── App.css               # Styling
    ├── public/
    ├── index.html                # HTML template
    └── package.json              # Frontend dependencies
```

## 🎯 Key Features Explained

### 1. **Multi-Database Architecture**
The application requires three different databases:
- **SQLite**: Automatically created for local file storage (`./uploads/database.db`)
- **MySQL**: Primary database for SQL query execution (must be running on localhost:3306 or configured remote server)
- **MongoDB**: User authentication and query history (must be running on localhost:27017 or configured remote server)

### 2. **Real-time Query Execution**
- Monaco Editor provides a professional IDE-like experience
- Queries are executed in real-time with instant results
- Results are displayed in formatted tables or JSON based on data type

### 3. **File Upload & Processing**
- CSV files are automatically parsed and converted to database tables
- Images can be uploaded and processed using Python AI to generate SQL queries
- Secure file storage with validation

### 4. **Query History Management**
- All executed queries are automatically saved
- Users can view, reuse, and manage their query history
- History is persisted across sessions

### 5. **Table Management**
- Dynamic sidebar showing all available tables
- Click on tables to view schema information
- Delete tables directly from the interface

## 🔧 Development Commands

### Backend
```bash
npm run dev          # Start development server with nodemon
npm test            # Run tests (placeholder)
npm start           # Start production server
```

### Frontend
```bash
npm run dev         # Start Vite development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License. See the LICENSE file for details.

## 🐛 Known Issues

- MongoDB deprecation warnings (functionality not affected)
- Large file uploads may take time to process
- Image-to-SQL conversion requires Python dependencies
- **MySQL and MongoDB must be running locally or configured remotely**
- Application will fail to start if databases are not accessible

## ⚠️ **Troubleshooting**

### Database Connection Issues:
```bash
# Check if MySQL is running
sudo service mysql status

# Check if MongoDB is running
sudo service mongodb status

# Restart services if needed
sudo service mysql restart
sudo service mongodb restart
```

### Common Errors:
- **"Connection refused"** - Database service not running
- **"Authentication failed"** - Check database credentials in .env
- **"Database not found"** - Create the required databases first

## 🔮 Future Enhancements

- [ ] Add more database support (PostgreSQL, Oracle)
- [ ] Implement query sharing between users
- [ ] Add data visualization features
- [ ] Implement query optimization suggestions
- [ ] Add export functionality for query results
- [ ] Implement collaborative editing features

---

**Made with ❤️ by [Aditya Gautam](https://github.com/Aditya-Gautam-2037), R. Goutham, Amit Kamble, Shivaniranjan**

For support or questions, please open an issue on GitHub.
