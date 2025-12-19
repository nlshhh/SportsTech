<div align="center">
  <img src="https://raw.githubusercontent.com/nlshhh/SportsTech/refs/heads/main/frontend/images/SportsTech.PNG" alt="SportsTech Logo" width="150px" />
  <h1>SportsTech 🚀</h1>
  <p><strong>Your Ultimate Full-Stack Fitness & Nutrition Partner</strong></p>
  <p>A complete MERN-stack web application with secure user authentication, personalized health tracking, and a live payment gateway.</p>
</div>

<div align="center">
  <!-- Badges -->
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js Badge"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js Badge"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB Badge"/>
  <img src="https://img.shields.io/badge/EJS-A91E50?style=for-the-badge&logo=ejs&logoColor=white" alt="EJS Badge"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript Badge"/>
  <img src="https://img.shields.io/github/repo-size/nlshhh/SportsTech" alt="Repo Size Badge"/>
  <img src="https://img.shields.io/github/last-commit/nlshhh/SportsTech" alt="Last Commit Badge"/>
</div>

---

## ✨ Key Features

*   ✅ **Full User Authentication:** Secure registration and login system using JSON Web Tokens (JWT) and `bcryptjs` for password hashing.
*   🔐 **Protected API Routes:** Custom middleware ensures that sensitive data is only accessible to logged-in users.
*   💧 **Per-User Water Intake Tracker:** A database-driven CRUD feature allowing users to track their daily water consumption.
*   📝 **Dynamic Contact Form:** Logged-in users can send messages that are saved directly to the database.
*   💳 **Live Payment Gateway:** Fully integrated with the **Razorpay API** for processing membership plan payments in a test environment.
*   🚀 **Server-Side Rendering (SSR):** Built with **EJS** as a template engine to create a maintainable codebase with reusable partials.
*   💻 **Object-Oriented Programming (OOP):** The frontend water tracker is architected as a JavaScript `class`, demonstrating modern OOP principles.
*   📱 **Fully Responsive Design:** A mobile-first approach with a custom CSS hamburger menu for a great user experience on all devices.

---

## 📂 Project Architecture

This project follows a standard MERN stack architecture with a clear separation of concerns.

```/
├── 📁 backend/
│   ├── 📁 models/        # Mongoose schemas (User, Order, etc.)
│   ├── 📁 middleware/    # Custom authentication middleware
│   ├── 📁 routes/        # API route definitions
│   ├── 📁 views/         # EJS templates for server-side rendering
│   └── 📄 ... (server files)
│
└── 📁 frontend/
    ├── 📁 images/        # All static images
    ├── 📄 script.js      # Client-side JavaScript (DOM, API calls, OOP)
    └── 📄 styles.css      # Main stylesheet
```

---

## 🛠️ How to Run This Project Locally

### Prerequisites

*   Node.js (v18 or higher)
*   npm (Node Package Manager)
*   MongoDB Atlas Account

### Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/nlshhh/SportsTech.git
    cd SportsTech/backend
    ```

2.  **Install backend dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    *   In the `backend` folder, find the file named `.env.example`.
    *   Create a **copy** of this file and rename the copy to just `.env`.
    *   Open the new `.env` file and fill in your actual secret keys (MongoDB URI, JWT Secret, and your Razorpay keys).

4.  **Run the server:**
    ```bash
    npm run dev
    ```

5.  **Open your browser** and navigate to `http://localhost:5000`.

---

<div align="center">
  Made with ❤️ by Neelesh Sachdeva
</div>