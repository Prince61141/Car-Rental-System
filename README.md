# Car Rental System

A full-stack web application for managing car rentals, built with Node.js, Express, MongoDB (backend), and React with Tailwind CSS (frontend).

## Features
- User registration and authentication (with roles)
- Car listing and management
- Booking and rental management
- Email/OTP verification
- Role-based access control (admin/user)
- Responsive UI

## Tech Stack
- **Backend:** Node.js, Express, MongoDB
- **Frontend:** React, Tailwind CSS
- **Other:** JWT, Nodemailer, Twilio

## Project Structure
```
Car Rental System/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── config/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- MongoDB

### Backend Setup
1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure environment variables in a `.env` file (see `config/db.js` for required variables).
4. Start the backend server:
   ```sh
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend folder:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend development server:
   ```sh
   npm start
   ```

## Usage
- Access the frontend at `http://localhost:3000`
- The backend runs on `http://localhost:5000`

## License 📄

This project is licensed under the [MIT License](LICENSE).

## Contact 📧

For questions or feedback, please contact [Prince Ghoda](mailto:princepatel61141@gmail.com).