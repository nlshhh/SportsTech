import './config.js';
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from './routes/authRoutes.js';
import waterRoutes from './routes/waterRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- EJS AND STATIC FILE SETUP ---

// 1. Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Serve static files (CSS, JS, images) from the 'frontend' folder
const frontendAssetsPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendAssetsPath));

// --- PAGE RENDERING ROUTES ---
// We now use res.render() instead of res.sendFile()

app.get("/", (req, res) => res.render('index', { activePage: 'home' })); 
app.get("/balanced-diet.html", (req, res) => res.render('balanced-diet', { activePage: 'diet' }));
app.get("/protein.html", (req, res) => res.render('protein', { activePage: 'tracker' }));
app.get("/calorie-calculator.html", (req, res) => res.render('calorie-calculator', { activePage: 'analyser' }));
app.get("/payments.html", (req, res) => res.render('payments', { activePage: 'plans' }));
app.get("/contact.html", (req, res) => res.render('contact', { activePage: 'contact' }));
app.get("/login.html", (req, res) => res.render('login', { activePage: 'login' }));
app.get("/register.html", (req, res) => res.render('register', { activePage: 'login' }));

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contact', contactRoutes);

// --- DB Connection & Server Start ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));