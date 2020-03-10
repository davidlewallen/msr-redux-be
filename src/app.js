require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('errorhandler');
const morgan = require('morgan');

// Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

// Configure variables
const port = process.env.PORT || 8000;
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

// Initiate our app
const app = express();

// Configure our app
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
  })
);

if (isDevelopment) {
  app.use(require('morgan')('dev'));
  app.use(errorHandler());
  app.use(morgan('dev'));
}

// Configure Mongoose
mongoose.connect(
  process.env[`MONGOOSE_DB_URL_${isProduction ? 'PROD' : 'DEV'}`],
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

if (isDevelopment) {
  mongoose.set('debug', true);
}

// Models & routes
require('./models/Users');
require('./config/passport');
app.use(require('./routes'));

// Error handlers & middlewares
app.use((err, req, res, next) => {
  res.status(err.status || 500);

  res.json({
    errors: {
      message: err.message,
      error: isDevelopment ? err : {},
    },
  });
});

app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}/`)
);
