<div align="center">

# 🌍 Lingua Connect

### _Bridging Languages, Connecting Cultures_

![Live Demo](https://img.shields.io/badge/Live%20Demo-Currently%20Offline-red?style=for-the-badge)
[![License](https://img.shields.io/badge/License-GPL--3.0-blue?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-19.x-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)](https://mongodb.com/)

</div>

> Note: This is a sample/reference project — it is not actively deployed. The Render demo linked below is offline.

---

## 📖 Overview

**Lingua Connect** is an innovative interactive online platform that seamlessly connects language learners with experienced tutors for personalized, one-on-one language lessons. Our platform empowers students to find the perfect tutor based on their target language, fluency level, budget, and schedule preferences.

---

## ✨ Key Features

### 👨‍🎓 For Students

| Feature                       | Description                                                           |
| ----------------------------- | --------------------------------------------------------------------- |
| 🔐 **User Registration**      | Easy and secure account creation process                              |
| 🔍 **Smart Tutor Search**     | Advanced filtering by language, experience, pricing, and availability |
| 📅 **Flexible Scheduling**    | Choose from 45, 60, or 90-minute lesson durations                     |
| 📚 **Interactive Flashcards** | Create, manage, and review language-specific flashcards               |
| 📊 **Progress Tracking**      | Monitor learning progress and test results                            |

### 👩‍🏫 For Tutors

| Feature                   | Description                                       |
| ------------------------- | ------------------------------------------------- |
| 🏫 **Class Management**   | Set up and organize classes based on availability |
| 💰 **Dynamic Pricing**    | Flexible pricing options based on teaching level  |
| 📋 **Student Assessment** | Create personalized tests with detailed feedback  |
| 📺 **Live Broadcasting**  | Host live sessions for multiple students          |

### 🌟 Core Platform Features

- **🎥 HD Video Calling**: Crystal-clear one-on-one video sessions with screen sharing
- **💳 Subscription Model**: Seamless subscription-based payment system powered by Stripe
- **📱 Responsive Design**: Optimized for all devices and screen sizes
- **🔔 Real-time Notifications**: Stay updated with class schedules and announcements

---

## 🚀 Advanced Features

### 📡 Live Broadcasting

- Tutors can host live sessions for multiple students simultaneously
- Flexible scheduling controlled by tutors
- Automated notifications for upcoming live sessions

### 📝 Personalized Assessment System

- Custom test creation by tutors
- Detailed question-by-question feedback
- Comprehensive test history and performance analytics

---

## 🛠️ Tech Stack

### Frontend

- **React 19.x** - Modern JavaScript library for building user interfaces
- **Vite** - Fast build tool and dev server
- **Redux Toolkit** - State management solution
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Popular icon library
- **React Toastify** - Notification system

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Stripe** - Payment processing

### Development Tools

- **Nodemon** - Development server auto-restart
- **Concurrently** - Run multiple npm scripts
- **Prettier** - Code formatting
- **Winston** - Logging library

---

## 📁 Project Structure

```
Lingua-Connect/
├── 📂 client/                 # React frontend application (Vite)
│   ├── index.html            # App entry HTML
│   └── 📂 src/
│       ├── 📂 api/           # API service files
│       ├── 📂 components/    # Reusable React components
│       ├── 📂 pages/         # Page components
│       ├── 📂 store/         # Redux store and slices
│       ├── 📂 utils/         # Utility functions
│       ├── App.jsx           # Main App component
│       └── index.jsx         # Entry point
├── 📂 server/                # Node.js backend application
│   ├── 📂 controllers/       # Request handlers
│   ├── 📂 middleware/        # Custom middleware
│   ├── 📂 models/           # Database models
│   ├── 📂 routes/           # API routes
│   ├── 📂 utils/            # Backend utilities
│   └── index.js             # Server entry point
├── package.json             # Root package configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── README.md               # Project documentation
```

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v19.0.0 or higher) 📦
- **npm** (v10.0.0 or higher) 📦
- **MongoDB** (local or cloud instance) 🗄️

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/Sagargupta16/Lingua-Connect.git
   cd Lingua-Connect
   ```

2. **Install all dependencies**

   ```bash
   npm run fb-install
   ```

3. **Set up environment variables**

   Create `.env` files in both `client` and `server` directories with necessary configurations:

   **Server `.env`:**

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```

4. **Start the development servers**

   ```bash
   npm run start
   ```

5. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)

### Alternative Commands

```bash
# Install frontend dependencies only
npm run frontend-install

# Install backend dependencies only
npm run backend-install

# Start frontend only
npm run frontend-start

# Start backend only
npm run backend-start

# Build for production
npm run frontend-build
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Workflow

1. **Fork the repository** to your GitHub account
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature-your-feature-name
   ```
3. **Implement your changes** following our coding standards
4. **Test thoroughly** to ensure no regressions
5. **Submit a pull request** with a clear description

### Branch Naming Convention

- `feature-*` for new features
- `bugfix-*` for bug fixes
- `hotfix-*` for urgent fixes

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Development Team

Meet the talented developers behind Lingua Connect:

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Sagargupta16">
        <img src="https://github.com/Sagargupta16.png" width="100px;" alt="Sagar Gupta"/>
        <br />
        <sub><b>Sagar Gupta</b></sub>
      </a>
      <br />
      <sub>Project Lead & Full Stack Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/sachin-gupta99">
        <img src="https://github.com/sachin-gupta99.png" width="100px;" alt="Sachin Gupta"/>
        <br />
        <sub><b>Sachin Gupta</b></sub>
      </a>
      <br />
      <sub>Frontend Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/DexTerMtor-Rahul">
        <img src="https://github.com/DexTerMtor-Rahul.png" width="100px;" alt="Rahul Raj"/>
        <br />
        <sub><b>Rahul Raj</b></sub>
      </a>
      <br />
      <sub>Backend Developer</sub>
    </td>
  </tr>
</table>

---

## 🔗 Links & Resources

### 🌐 Live Application

- **Production**: `https://trinit-bugbiters-dev.onrender.com` (offline - sample deployment, Render service suspended)

### 📚 Documentation & References

- [MERN Stack Guide](https://www.mongodb.com/mern-stack)
- [React Documentation](https://reactjs.org/)
- [Node.js Documentation](https://nodejs.org/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://www.mongodb.com/)
- [Stripe Integration Guide](https://stripe.com/docs)

### 🛠️ Development Tools

- [React Router](https://reactrouter.com/)
- [Axios HTTP Client](https://axios-http.com/)
- [JWT Authentication](https://jwt.io/)
- [Bcrypt Hashing](https://www.npmjs.com/package/bcrypt)
- [Mongoose ODM](https://mongoosejs.com/)
- [Nodemailer](https://nodemailer.com/)

---

<div align="center">

### 🌟 Star this repository if you found it helpful!

**Made with ❤️ by the BugBiters Team**

</div>
