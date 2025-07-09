# Job Analytics Dashboard

A comprehensive job analytics and expense management system built with Vue.js frontend and Express.js backend with MySQL database.

## Features

### 🎯 Dashboard
- **Overview statistics**: Monthly earnings, hours worked, days worked, and net income
- **Recent activity**: Quick view of recent work days and transactions
- **Quick actions**: Fast access to common tasks
- **Upcoming schedule**: See your planned work days
- **Real-time updates**: Live dashboard updates

### 💼 Work Management
- **Work day logging**: Record daily hours worked with automatic payment calculation
- **Editable hourly rate**: Update your hourly rate anytime
- **Work history**: View and edit past work days with pagination
- **Monthly/yearly filtering**: Filter work days by specific periods
- **Notes support**: Add notes to work days for better tracking

### 💰 Expense & Income Tracking
- **Income/Expense management**: Track all your financial transactions
- **Category organization**: Organize transactions by custom categories
- **Monthly summaries**: See your financial overview by month
- **Filtering & search**: Filter by type, category, date range
- **Net income calculation**: Automatic calculation including work earnings

### 📅 Work Schedule
- **Weekly schedule setup**: Define your standard work days and hours
- **Flexible scheduling**: Set different hours for different days
- **Schedule adherence tracking**: See how well you stick to your planned schedule
- **Weekly earnings estimation**: Automatic calculation based on schedule and hourly rate

### 📊 Statistics & Analytics
- **Year overview**: Comprehensive yearly statistics with charts
- **Monthly breakdowns**: Detailed monthly analysis
- **Trend analysis**: Visual charts showing work patterns and earnings
- **Goal tracking**: Progress bars for monthly hour and earnings goals
- **Export functionality**: Export your data for backup or external analysis

### ⚙️ Profile & Settings
- **User profile management**: Update personal information and hourly rate
- **Account statistics**: View lifetime totals and achievements
- **Data export**: Download your work and expense data
- **Modern UI**: Clean, responsive design with Bootstrap 5

## Technology Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Vue Router 4** - Client-side routing
- **Bootstrap 5** - Modern CSS framework
- **Chart.js** - Beautiful charts and graphs
- **Axios** - HTTP client for API calls
- **Vue Toastification** - Toast notifications
- **Date-fns** - Date manipulation utilities

### Backend
- **Express.js** - Web application framework
- **MySQL 2** - Database connectivity
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Database
- **MySQL** - Relational database
- **Structured schema** with foreign keys and constraints
- **Optimized queries** for performance
- **Data integrity** with proper validation

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=job_analytics
   JWT_SECRET=your_super_secret_jwt_key
   ```

4. **Setup database**
   ```bash
   npm run setup-db
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

   The backend will be running on `http://localhost:3001`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run serve
   ```

   The frontend will be running on `http://localhost:8080`

### First Time Setup

1. **Register your account**
   - Visit `http://localhost:8080`
   - Click "Sign up" and create your account
   - Set your initial hourly rate

2. **Configure your schedule**
   - Go to Schedule page
   - Set your work days and default hours
   - Save your schedule

3. **Start tracking**
   - Log your first work day
   - Add your first expense/income
   - Explore the dashboard and statistics

## Usage Guide

### Logging Work Days
1. Go to **Work Log** page
2. Click **"Log Work Day"**
3. Enter the date, hours worked, and optional notes
4. Save - payment is automatically calculated

### Managing Expenses
1. Go to **Expenses** page
2. Click **"Add Transaction"**
3. Choose income or expense
4. Fill in details (description, category, amount)
5. Save and view in your transaction history

### Viewing Statistics
1. Go to **Statistics** page
2. Select year/month for analysis
3. View charts, trends, and summaries
4. Track your progress against goals

### Updating Settings
1. Go to **Profile** page
2. Update your hourly rate as needed
3. Export data for backup
4. View account statistics

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/hourly-rate` - Update hourly rate

### Work Management
- `GET /api/work/days` - Get work days (paginated)
- `POST /api/work/days` - Add work day
- `PUT /api/work/days/:id` - Update work day
- `DELETE /api/work/days/:id` - Delete work day
- `GET /api/work/schedule` - Get work schedule
- `PUT /api/work/schedule` - Update work schedule
- `GET /api/work/stats/monthly` - Get monthly work stats

### Expense Management
- `GET /api/expenses` - Get expenses (paginated, filtered)
- `POST /api/expenses` - Add expense/income
- `PUT /api/expenses/:id` - Update expense/income
- `DELETE /api/expenses/:id` - Delete expense/income
- `GET /api/expenses/categories` - Get expense categories
- `GET /api/expenses/summary/monthly` - Get monthly summary
- `GET /api/expenses/summary/category` - Get category breakdown

### Dashboard & Statistics
- `GET /api/dashboard/overview` - Dashboard overview data
- `GET /api/dashboard/year-overview` - Yearly statistics
- `GET /api/dashboard/upcoming-schedule` - Upcoming work days

## Database Schema

### Users Table
- User authentication and profile information
- Hourly rate storage
- Account creation tracking

### Work Days Table
- Daily work hour tracking
- Automatic payment calculation
- Notes and metadata

### Expenses Table
- Income and expense tracking
- Category organization
- Date-based filtering

### Work Schedule Table
- Weekly schedule configuration
- Day-of-week preferences
- Default hours per day

## Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt for password security
- **Input Validation** - Server-side validation for all inputs
- **CORS Protection** - Proper cross-origin configuration
- **Helmet Security** - Security headers and protections
- **SQL Injection Prevention** - Parameterized queries

## Performance Features

- **Database Indexing** - Optimized queries with proper indexes
- **Pagination** - Large datasets handled efficiently
- **Caching** - Frontend state management and caching
- **Lazy Loading** - Components loaded on demand
- **Optimized Bundle** - Modern build tools and optimization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm run serve  # Hot reload development server
```

### Building for Production
```bash
# Frontend
cd frontend
npm run build

# Backend - use PM2 or similar for production
cd backend
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please create an issue in the repository or contact the development team.

---

**Built with ❤️ for efficient job and expense tracking**
