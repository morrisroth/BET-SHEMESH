// Node.js Express Server for Beit Shemesh Tech Hub

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            baseUri: ["'self'"],
            fontSrc: ["'self'", "https:", "data:"],
            formAction: ["'self'"],
            frameAncestors: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            objectSrc: ["'none'"],
            scriptSrc: ["'self'"],
            scriptSrcAttr: ["'none'"],
            styleSrc: ["'self'", "https:", "'unsafe-inline'"],
            upgradeInsecureRequests: []
        }
    }
}));
app.use(compression());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'יותר מדי פניות, נסה שוב מאוחר יותר.'
});

app.use('/api/', limiter);

// Serve static files
app.use(express.static(path.join(__dirname)));

// Schemas
const ArticleSchema = new mongoose.Schema({
    title: { type: String, required: true, hebrew: true },
    author: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, enum: ['startups', 'education', 'events', 'success', 'technology'] },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    date: { type: Date, default: Date.now },
    image: String,
    tags: [String],
    seoDescription: String,
    seoKeywords: [String]
});

const ContactSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    reason: { type: String, enum: ['recruitment', 'partnership', 'events', 'education', 'other'], required: true },
    developersNeeded: String,
    techStack: [String],
    message: String,
    newsletter: { type: Boolean, default: false },
    status: { type: String, enum: ['new', 'in-progress', 'completed'], default: 'new' },
    date: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'editor'], default: 'editor' },
    lastLogin: Date
});

const StatisticsSchema = new mongoose.Schema({
    developerCount: { type: Number, default: 500 },
    companyCount: { type: Number, default: 30 },
    bootcampCount: { type: Number, default: 8 },
    successRate: { type: Number, default: 95 },
    lastUpdated: { type: Date, default: Date.now }
});

// Models
const Article = mongoose.model('Article', ArticleSchema);
const Contact = mongoose.model('Contact', ContactSchema);
const User = mongoose.model('User', UserSchema);
const Statistics = mongoose.model('Statistics', StatisticsSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'beitshemeshtech2023secret';

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'beitshemeshtech@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'טוקן נדרש' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'טוקן לא תקין' });
    }
};

// Routes

// Serve frontend pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/talent.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'talent.html'));
});

app.get('/news.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'news.html'));
});

app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/admin/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

app.get('/admin/dashboard.html', verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

// API Routes

// Authentication
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'שם משתמש או סיסמה שגויים' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'שם משתמש או סיסמה שגויים' });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'התחברות הצליחה',
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'שגיאת שרת', error: error.message });
    }
});

// Verify token endpoint
app.get('/api/auth/verify', verifyToken, (req, res) => {
    res.json({
        message: 'Token is valid',
        user: {
            id: req.user.id,
            username: req.user.username,
            role: req.user.role
        }
    });
});

// Logout endpoint
app.post('/api/auth/logout', verifyToken, (req, res) => {
    // In a real application, you might want to blacklist the token
    // For now, we'll just clear it on the client side
    res.json({ message: 'Logout successful' });
});

// Articles API
app.get('/api/articles', async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search, status = 'published' } = req.query;
        const skip = (page - 1) * limit;

        let query = { status };
        if (category) query.category = category;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const articles = await Article.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Article.countDocuments(query);

        res.json({
            articles,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'שגיאת שרת', error: error.message });
    }
});

app.post('/api/articles', verifyToken, async (req, res) => {
    try {
        const article = new Article(req.body);
        await article.save();
        res.status(201).json({ message: 'המאמר נשמר בהצלחה', article });
    } catch (error) {
        res.status(500).json({ message: 'שגיאת שרת', error: error.message });
    }
});

app.put('/api/articles/:id', verifyToken, async (req, res) => {
    try {
        const article = await Article.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!article) {
            return res.status(404).json({ message: 'מאמר לא נמצא' });
        }

        res.json({ message: 'המאמר עודכן בהצלחה', article });
    } catch (error) {
        res.status(500).json({ message: 'שגיאת שרת', error: error.message });
    }
});

app.delete('/api/articles/:id', verifyToken, async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id);

        if (!article) {
            return res.status(404).json({ message: 'מאמר לא נמצא' });
        }

        res.json({ message: 'המאמר נמחק בהצלחה' });
    } catch (error) {
        res.status(500).json({ message: 'שגיאת שרת', error: error.message });
    }
});

// Get single article by ID
app.get('/api/articles/:id', verifyToken, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        
        if (!article) {
            return res.status(404).json({ message: 'מאמר לא נמצא' });
        }
        
        res.json(article);
    } catch (error) {
        res.status(500).json({ message: 'שגיאת שרת', error: error.message });
    }
});

// Contact API
app.post('/api/contact', async (req, res) => {
    try {
        const contact = new Contact(req.body);
        await contact.save();

        // Try to send emails, but don't fail if email sending fails
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: contact.email,
                subject: 'קבלת פנייה - הייטק בית שמש',
                html: `
                    <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <h2 style="color: #0066cc;">תודה על פנייתך!</h2>
                        <p>שלום ${contact.contactPerson},</p>
                        <p>קיבלנו את פנייתך מ-${contact.companyName} ונעשה להגיב בהקדם האפשרי.</p>
                        <p><strong>סיבת פנייה:</strong> ${contact.reason}</p>
                        ${contact.message ? `<p><strong>הודעה:</strong> ${contact.message}</p>` : ''}
                        <p>במידה ונעשה לעזור לך למצוא את הכישרונות הטובים ביותר בבית שמש.</p>
                        <br>
                        <p>בברכה,<br>צוות הייטק בית שמש</p>
                    </div>
                `
            };
            await transporter.sendMail(mailOptions);

            const adminMailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.ADMIN_EMAIL || 'info@beitshemeshtech.org',
                subject: `פנייה חדשה מ-${contact.companyName}`,
                html: `
                    <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <h2 style="color: #0066cc;">פנייה חדשה מחברה</h2>
                        <p><strong>שם חברה:</strong> ${contact.companyName}</p>
                        <p><strong>איש קשר:</strong> ${contact.contactPerson}</p>
                        <p><strong>דוא"ל:</strong> ${contact.email}</p>
                        <p><strong>טלפון:</strong> ${contact.phone || 'לא צוין'}</p>
                        <p><strong>סיבת פנייה:</strong> ${contact.reason}</p>
                        ${contact.developersNeeded ? `<p><strong>מספר מפתחים דרוש:</strong> ${contact.developersNeeded}</p>` : ''}
                        ${contact.techStack && contact.techStack.length > 0 ? `<p><strong>טכנולוגיות:</strong> ${contact.techStack.join(', ')}</p>` : ''}
                        ${contact.message ? `<p><strong>הודעה:</strong> ${contact.message}</p>` : ''}
                        <p>נא לטפל בפנייה זו במערכת הניהול.</p>
                    </div>
                `
            };
            await transporter.sendMail(adminMailOptions);
        } catch (emailError) {
            console.error('Email sending failed, but contact was saved:', emailError.message);
        }

        res.status(201).json({ message: 'הפנייה נשלחה בהצלחה' });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ message: 'שגיאת שרת', error: error.message });
    }
});

app.get('/api/contact', verifyToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (status) query.status = status;

        const contacts = await Contact.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Contact.countDocuments(query);

        res.json({
            contacts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'שגיאת שרת', error: error.message });
    }
});

// Get single contact by ID
app.get('/api/contact/:id', verifyToken, async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        
        if (!contact) {
            return res.status(404).json({ message: 'פנייה לא נמצאה' });
        }
        
        res.json(contact);
    } catch (error) {
        res.status(500).json({ message: 'שגיאת שרת', error: error.message });
    }
});

// Update contact status
app.put('/api/contact/:id/status', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        
        if (!contact) {
            return res.status(404).json({ message: 'פנייה לא נמצאה' });
        }
        
        res.json({ message: 'סטטוס עודכן בהצלחה', contact });
    } catch (error) {
        res.status(500).json({ message: 'שגיאת שרת', error: error.message });
    }
});

// Respond to contact
app.post('/api/contact/respond', verifyToken, async (req, res) => {
    try {
        const { contactId, subject, message, status } = req.body;
        
        // Find the contact
        const contact = await Contact.findById(contactId);
        if (!contact) {
            return res.status(404).json({ message: 'פנייה לא נמצאה' });
        }
        
        // Update contact status
        contact.status = status;
        await contact.save();
        
        // Try to send email response
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: contact.email,
                subject: subject,
                html: `
                    <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <h2 style="color: #0066cc;">תגובה מהייטק בית שמש</h2>
                        <p>שלום ${contact.contactPerson},</p>
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            ${message.replace(/\n/g, '<br>')}
                        </div>
                        <p>במידה ונעשה לעזור לך למצוא את הכישרונות הטובים ביותר בבית שמש.</p>
                        <br>
                        <p>בברכה,<br>צוות הייטק בית שמש</p>
                        <hr>
                        <p style="font-size: 0.8em; color: #666;">
                            דוא"ל זה נשלח בתגובה לפנייתך מתאריך ${new Date(contact.date).toLocaleDateString('he-IL')}
                        </p>
                    </div>
                `
            };
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error('Email sending failed:', emailError.message);
            // Don't fail the request if email fails
        }
        
        res.json({ message: 'התגובה נשלחה בהצלחה' });
    } catch (error) {
        console.error('Error responding to contact:', error);
        res.status(500).json({ message: 'שגיאת שרת', error: error.message });
    }
});

// Statistics API
app.get('/api/statistics', async (req, res) => {
    try {
        let statistics = await Statistics.findOne();
        if (!statistics) {
            statistics = new Statistics();
            await statistics.save();
        }

        res.json(statistics);
    } catch (error) {
        res.status(500).json({ message: 'שגיאת שרת', error: error.message });
    }
});

app.put('/api/statistics', verifyToken, async (req, res) => {
    try {
        let statistics = await Statistics.findOne();
        if (!statistics) statistics = new Statistics();

        Object.assign(statistics, req.body);
        statistics.lastUpdated = new Date();
        await statistics.save();

        res.json({ message: 'הסטטיסטיקות עודכנו בהצלחה', statistics });
    } catch (error) {
        res.status(500).json({ message: 'שגיאת שרת', error: error.message });
    }
});

// Analytics API
app.get('/api/analytics', verifyToken, async (req, res) => {
    try {
        const { period = 'month' } = req.query;

        let dateFilter = {};
        if (period === 'week') {
            dateFilter = { date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
        } else if (period === 'month') {
            dateFilter = { date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
        } else if (period === 'year') {
            dateFilter = { date: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } };
        }

        const contactsByPeriod = await Contact.aggregate([
            { $match: dateFilter },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const articlesByPeriod = await Article.aggregate([
            { $match: { ...dateFilter, status: 'published' } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const totalContacts = await Contact.countDocuments();
        const totalArticles = await Article.countDocuments({ status: 'published' });
        const contactsByStatus = await Contact.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.json({
            contactsByPeriod,
            articlesByPeriod,
            overview: { totalContacts, totalArticles, contactsByStatus }
        });
    } catch (error) {
        res.status(500).json({ message: 'שגיאת שרת', error: error.message });
    }
});

// Initialize default admin user
const initializeAdmin = async () => {
    try {
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('beitshemeshtech2023', 10);
            const admin = new User({ username: 'admin', password: hashedPassword, role: 'admin' });
            await admin.save();
            console.log('Default admin user created');
        }
    } catch (error) {
        console.log('Error creating admin user:', error.message);
    }
};

// MongoDB Connection
mongoose.connect(MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB error:", err));

// Start server
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await initializeAdmin();
});
