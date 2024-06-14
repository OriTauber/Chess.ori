const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');
const User = require('./Models/UserSchema.js');
const Game = require('./Models/GameSchema.js');
const { UserSchema } = require('./Schemas/UserSchema.js');
const ExpressError = require('./ExpressError.js')

const redisClient = redis.createClient();
const app = express();
(async () => {
    await redisClient.connect();
})();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/chessdotori')
    .then(() => {
        console.log("MongoDB connected!");
    }).catch((err) => {
        console.error("Mongo connection error!", err);
    });

// Middleware for static files and URL encoding
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use(express.urlencoded({ extended: true }));

// Session management with Redis
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Validation middleware
const validateRegister = (req, res, next) => {
    const { error } = UserSchema.validate(req.body);
    if (error && error.details) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};
const validateLogin = (req, res, next) => {
    const { error } = LoginSchema.validate(req.body);
    if (error && error.details) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};
const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).send("You must be logged in.");
    }
    next();
};
// Routes
app.get('/', (req, res) => {
    res.redirect('/join');
});

app.post('/register', validateRegister, async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.send("ok");
});
app.post('/login', validateLogin, async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        res.send("Logged in!");
    } else {
        throw new ExpressError("Invalid username or password", 400);
    }
});
app.post('/logout', validateLogin, async (req, res) => {
    delete req.session.userId;
    res.redirect('/');
});

// Start the server
app.listen(5000, () => {
    console.log("Listening on port 5000!");
});
