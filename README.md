# Car Rental System 🚗

A full-stack web application for managing car rentals with real-time booking, payment integration (Razorpay), and comprehensive dashboards for renters, owners, and administrators.

## ✨ Features

### User Management
- 🔐 Secure authentication with JWT tokens and automatic session management
- 👥 Role-based access control (Admin, Renter, Peer Owner)
- 📧 Email/OTP verification with Nodemailer
- 🔄 Token expiration handling with automatic logout
- ✅ Owner and Renter verification system

### Car Management
- 📝 Complete car listing with detailed specifications
- 📸 Multi-image upload with Cloudinary integration
- 🔍 Advanced search and filtering by brand, city, area
- 📊 Real-time availability checking
- 📄 Document management for car registration and insurance

### Booking System
- 📅 Smart booking with conflict detection
- 💳 Integrated payment gateway (Razorpay)
- 🧾 Automatic pricing calculation with configurable policies
- ⏰ Late fee and challan management
- ✅ Booking completion workflow with inspection

### Dashboards

#### Renter Dashboard
- View active and past bookings
- Payment history and transactions
- Real-time notifications
- Profile settings and verification

#### Owner Dashboard
- Car management (list, edit, delete)
- Booking reports and analytics
- Payout management with bank details
- Transaction history
- Notifications for new bookings
- Overview with earnings and statistics

#### Admin Dashboard
- User management (approve, suspend, delete)
- System-wide transaction monitoring
- Completed bookings overview
- Platform analytics

### Payment Integration
- 💰 Razorpay payment gateway for secure transactions
- 🔒 Payment signature verification
- 📜 Detailed transaction history
- 💸 Automated payout processing for owners

### AI Integration
- 🤖 Chatbot for user assistance
- 💬 Intelligent query handling

### Notifications
- 🔔 Real-time booking status updates
- 📨 Email notifications for important events
- ⏲️ Reminder system for pickups and returns

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js (v14+)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **Image Storage:** Cloudinary
- **Payments:** Razorpay SDK
- **Email:** Nodemailer
- **Security:** bcryptjs, cors
- **OTP:** Custom implementation with email

### Frontend
- **Library:** React (Create React App)
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **HTTP Client:** Fetch API
- **JWT Handling:** jwt-decode
- **Payment:** Razorpay Checkout SDK

## 📁 Project Structure

```
Car Rental System/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── adminController.js    # Admin operations
│   │   ├── aiController.js       # AI chatbot logic
│   │   ├── bookingController.js  # Booking CRUD
│   │   ├── carController.js      # Car management
│   │   ├── ownerController.js    # Owner-specific operations
│   │   ├── renterController.js   # Renter-specific operations
│   │   ├── transactionController.js
│   │   └── userController.js     # Auth & profile
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification
│   │   └── roleMiddleware.js     # Role-based access
│   ├── models/
│   │   ├── Booking.js
│   │   ├── Car.js
│   │   ├── Document.js
│   │   ├── PayoutDetails.js
│   │   ├── Transaction.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── carRoutes.js
│   │   ├── ownerRoutes.js
│   │   ├── payment.js
│   │   ├── renterRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── cloudinary.js         # Image upload config
│   │   ├── mailTemplates.js      # Email templates
│   │   ├── sendEmail.js          # Email sender
│   │   └── sendOtp.js            # OTP generation
│   ├── .env
│   ├── package.json
│   └── server.js                 # Entry point
├── frontend/
│   ├── public/
│   │   ├── icon.png
│   │   └── index.html
│   ├── src/
│   │   ├── assets/
│   │   │   ├── banks.json           # Bank list for payout
│   │   │   ├── carbrand.json        # Car brands
│   │   │   ├── cityAreaMap.json     # City-area mapping
│   │   │   ├── stateCityMap.json    # State-city mapping
│   │   │   ├── pincodePrefixMap.json
│   │   │   ├── car-register.png
│   │   │   ├── car.png
│   │   │   ├── robot.png
│   │   │   ├── user.png
│   │   │   └── loading.css
│   │   ├── components/
│   │   │   ├── Admin_Dashboard/
│   │   │   │   ├── CompletedBookings.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Topbar.jsx
│   │   │   │   ├── Transactions.jsx
│   │   │   │   └── Users.jsx
│   │   │   ├── Homepage/
│   │   │   │   ├── CarCard.jsx
│   │   │   │   ├── Feature.jsx
│   │   │   │   ├── Hero.jsx
│   │   │   │   ├── Searchbar.jsx
│   │   │   │   └── Testimonal.jsx
│   │   │   ├── Owner_Dashboard/
│   │   │   │   ├── Booking.jsx
│   │   │   │   ├── CarDetailsModal.jsx
│   │   │   │   ├── CarReport.jsx
│   │   │   │   ├── Cars.jsx
│   │   │   │   ├── EditCar.jsx
│   │   │   │   ├── ListCar.jsx
│   │   │   │   ├── Notifications.jsx
│   │   │   │   ├── Overview.jsx
│   │   │   │   ├── OwnerVerification.jsx
│   │   │   │   ├── PaymentDetails.jsx
│   │   │   │   ├── Settings.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Topbar.jsx
│   │   │   │   └── Transactions.jsx
│   │   │   ├── Renter_Dashboard/
│   │   │   │   ├── Booking.jsx
│   │   │   │   ├── dashboardBus.jsx
│   │   │   │   ├── Notifications.jsx
│   │   │   │   ├── Overview.jsx
│   │   │   │   ├── RenterVerification.jsx
│   │   │   │   ├── Settings.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Transactions.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Header.jsx
│   │   ├── pages/
│   │   │   ├── About.jsx
│   │   │   ├── Admin_Dashboard.jsx
│   │   │   ├── CarsPage.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Owner_Dashboard.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── RentCarPage.jsx
│   │   │   ├── Renter_Dashboard.jsx
│   │   │   └── ResetPassword.jsx
│   │   ├── utils/
│   │   │   ├── adminApi.js
│   │   │   └── pricePolicy.js
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   ├── .env
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4+)
- npm or yarn
- Cloudinary account (for image uploads)
- Razorpay account (for payment integration)
- Gmail account (for email notifications)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/car-rental-system.git
cd car-rental-system
```

#### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/car_rental

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay (Payment)
RAZORPAY_KEY_ID=rzp_test_your_key_here
RAZORPAY_KEY_SECRET=your_secret_here

# Email (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3000
```

**Note:** For Gmail, you need to generate an [App Password](https://support.google.com/accounts/answer/185833).

Start the backend server:
```bash
npm start
# or for development with nodemon:
npm run dev
```

#### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_here
```

Start the frontend development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## 🌐 Usage

### Development
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:5000`

### Creating Admin Account

After registration, update user role in MongoDB:

```javascript
// Using MongoDB Compass or Shell
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin", verified: true } }
);
```

### User Roles

1. **Renter** - Can browse and book cars
2. **Peer Owner** - Can list cars and manage bookings
3. **Admin** - Full system access and management

## 🔧 Configuration

### Environment Variables

#### Backend

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret for JWT signing | Yes | - |
| `JWT_EXPIRES_IN` | Token expiration time | No | 7d |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes | - |
| `RAZORPAY_KEY_ID` | Razorpay key ID | Yes | - |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | Yes | - |
| `EMAIL_USER` | Email for notifications | Yes | - |
| `EMAIL_PASS` | Email app password | Yes | - |
| `FRONTEND_URL` | Frontend URL for CORS | No | http://localhost:3000 |

#### Frontend

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_API_URL` | Backend API URL | Yes |
| `REACT_APP_RAZORPAY_KEY_ID` | Razorpay public key | Yes |

### Price Policy Configuration

Edit `frontend/src/utils/pricePolicy.js` to customize pricing rules:
- Base price calculation
- Late fee policies
- Challan and toll charges

## 📦 Key Features Explained

### Booking Flow
1. User selects car and date/time
2. System checks availability and calculates price
3. User proceeds to payment (Razorpay)
4. Payment verification on backend
5. Booking confirmed and notification sent

### Payment Processing
- Frontend creates Razorpay order via backend
- User completes payment
- Backend verifies payment signature
- Transaction and booking records created

### Document Management
- Cloudinary integration for secure uploads
- Support for car documents (RC, insurance)
- User verification documents (license, Aadhaar)

### Notification System
- Email notifications for:
  - Booking confirmation
  - Payment receipts
  - Booking reminders
  - Status updates

## 🚀 Performance Features

- **Backend Optimizations:**
  - MongoDB indexes on frequently queried fields
  - Lean queries for faster response
  - Field projection to reduce payload
  - Pagination on list endpoints

- **Frontend Optimizations:**
  - Lazy loading for images
  - Code splitting by routes
  - Environment-based API URLs
  - Token-based caching

## 📝 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `POST /api/users/verify-otp` - Verify email OTP
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password` - Reset password with token
- `GET /api/users/profile` - Get user profile (protected)

### Cars
- `GET /api/cars` - List all cars (with filters)
- `GET /api/cars/:id` - Get single car details
- `POST /api/cars` - Add new car (owner only)
- `PUT /api/cars/:id` - Update car (owner only)
- `DELETE /api/cars/:id` - Delete car (owner/admin)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `PATCH /api/bookings/:id/complete` - Complete booking (owner)

### Payments
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment signature

### Admin
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:id` - Update user (suspend, verify)
- `GET /api/admin/transactions` - View all transactions

### Owner
- `GET /api/owner/bookings` - Get bookings for owner's cars
- `POST /api/owner/payout-details` - Add/update bank details
- `GET /api/owner/earnings` - View earnings report

### Renter
- `GET /api/renter/bookings` - Get renter's bookings
- `POST /api/renter/verify` - Submit verification documents

## License 📄

This project is licensed under the [MIT License](LICENSE).

## Contact 📧

For questions or feedback, please contact [Prince Ghoda](mailto:princepatel61141@gmail.com).