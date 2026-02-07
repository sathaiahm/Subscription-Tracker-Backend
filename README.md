
# Subscription Tracker API

A robust backend API for managing subscriptions, tracking expenses, and sending timely renewal reminders. Built with **Node.js**, **Express**, and **MongoDB**, featuring advanced security with **Arcjet** and workflow automation with **Upstash**.

---

## 🚀 Features

-   **Authentication & Authorization**: Secure User Sign-up/Sign-in using JWT (stored in HTTP-only cookies).
-   **Subscription Management**: Create, Read, Update (Cancel), and Delete subscriptions.
-   **Automated Reminders**: Email reminders sent via **Upstash Workflow** for upcoming renewals (7 days, 5 days, 2 days, 1 day before).
-   **Analytics**: Visualize spending habits with expense breakdowns and category distribution.
-   **Security**: Rate limiting, bot protection, and attack analysis powered by **Arcjet**.
-   **Database**: Modeled with **Mongoose** for structured data validation.
-   **Environment Configuration**: Supports Development and Production environments via `.env` files.

---

## 🛠️ Tech Stack

-   **Runtime**: [Node.js](https://nodejs.org/)
-   **Framework**: [Express.js](https://expressjs.com/)
-   **Database**: [MongoDB](https://www.mongodb.com/) (with [Mongoose](https://mongoosejs.com/))
-   **Workflow Automation**: [Upstash Workflow](https://upstash.com/docs/workflow/getstarted) (for scheduled emails)
-   **Security**: [Arcjet](https://arcjet.com/) (Rate Limiting & Bot Detection)
-   **Email Service**: [Nodemailer](https://nodemailer.com/) (SMTP)
-   **Validation**: Custom Mongoose Validators
-   **Utilities**: `dayjs` (Date handling), `bcrypt` (Password hashing)

---

## 📂 Project Structure

```
Backend/
├── config/             # Configuration files (DB, Arcjet, Env, Nodemailer)
├── controller/         # Request handlers (Auth, User, Subscription, Workflow)
├── Database/           # Database connection logic
├── middleware/         # Custom middleware (Auth, Error Handling, Arcjet Security)
├── modules/            # Mongoose Models (User, Subscription)
├── routes/             # API Route definitions
├── utils/              # Helper functions (Email Sender)
├── app.js              # Express app setup
└── server.js           # Server entry point
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/sathaiahm/Subscription-Tracker-Backend.git
cd Subscription-Tracker-Backend/Backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a file named `.env.development.local` in the root directory and add the following keys:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
SERVER_URL=http://localhost:3000

# Database
DB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/subscription-tracker

# Authentication (JWT)
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPRESS_IN=7d

# Arcjet Security
ARCJECT_KEY=aj_...
ARCJECT_ENV=development

# Upstash Workflow (QStash)
QSTASH_URL=https://qstash.upstash.io/v2/publish/
QSTASH_TOKEN=ey...

# Email Service (Nodemailer - e.g., Gmail App Password)
EMAIL_PASSWORD=your_email_app_password
```

### 4. Run the Application

**Development Mode** (with Nodemon):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

The server will start at `http://localhost:3000`.

---

## 📡 API Endpoints

### **Authentication** (`/api/auth`)
-   `POST /signup` - Register a new user.
-   `POST /login` - User login.
-   `POST /logout` - User logout.

### **User** (`/api/users`)
-   `GET /me` - Get current user profile.
-   `GET /:id` - Get specific user details.

### **Subscriptions** (`/api/subscriptions`)
-   `POST /` - Create a new subscription.
-   `GET /` - Get all subscriptions for the logged-in user.
-   `GET /:id` - Get details of a specific subscription.
-   `PATCH /:id/cancel` - Cancel a subscription.
-   `DELETE /:id` - Delete a subscription.
-   `GET /upcoming-renewals` - Get subscriptions renewing in the next 7 days.

### **Analytics** (`/api/analytics`)
-   `GET /expenses` - Get total expense breakdown.
-   `GET /categories` - Get expense distribution by category.

### **Workflow** (`/api/workflow`)
-   `POST /subscription/remainder` - Trigger subscription reminder workflow (Internal/Upstash use).

---

## 🧪 Testing

You can use the provided test script to verifying API functionality:
```bash
node test_all_apis.js
```
*Note: Ensure the server is running before executing tests.*

---

## 🔒 Security Features

-   **Arcjet Middleware**: protects routes from bots and excessive requests.
    -   *Dev Note*: Arcjet protection is bypassed when `NODE_ENV=development` to facilitate local testing.
-   **Authentication Middleware**: Verifies JWT tokens from HTTP-only cookies or Authorization headers.
-   **Error Handling**: Centralized error middleware ensures consistent error responses and safe failure modes.

---

## 📄 License

This project is licensed under the MIT License.
