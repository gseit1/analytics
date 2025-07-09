#!/bin/bash

echo "========================================"
echo "   Job Analytics Dashboard Setup"
echo "========================================"
echo

echo "Step 1: Installing Backend Dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    exit 1
fi
cd ..

echo
echo "Step 2: Installing Frontend Dependencies..."
cd frontend 
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    exit 1
fi
cd ..

echo
echo "Step 3: Setting up environment file..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "Environment file created at backend/.env"
    echo
    echo "========================================"
    echo "IMPORTANT: Please edit backend/.env file"
    echo "with your MySQL database credentials:"
    echo "- DB_HOST=localhost"
    echo "- DB_USER=your_mysql_username"  
    echo "- DB_PASSWORD=your_mysql_password"
    echo "- DB_NAME=job_analytics"
    echo "========================================"
    echo
    read -p "Press enter to continue after editing .env file..."
else
    echo "Environment file already exists"
fi

echo
echo "Step 4: Setting up database..."
echo "Make sure MySQL is running and credentials in .env are correct"
read -p "Press enter to continue..."
cd backend
npm run setup-db
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to setup database"
    echo "Please check your MySQL connection and credentials in backend/.env"
    exit 1
fi
cd ..

echo
echo "========================================"
echo "Setup completed successfully!"
echo "========================================"
echo
echo "To start the application:"
echo "1. Open two terminal windows"
echo "2. In first terminal: cd backend && npm run dev"
echo "3. In second terminal: cd frontend && npm run serve"  
echo "4. Open http://localhost:8080 in your browser"
echo "5. Register your account and start tracking!"
echo
echo "Or use VS Code tasks:"
echo "- Ctrl+Shift+P -> \"Tasks: Run Task\""
echo "- Select \"Start Full Application\""
echo
