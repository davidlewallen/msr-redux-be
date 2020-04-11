require('dotenv').config();

import express from 'express';
import path from 'path';
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import errorHandler from 'errorhandler'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

import './models/Users'
import './config/passport'

import routes from './routes'

// Configure mongoose's promise to global promise
// mongoose.promise = global.Promise;

// Configure variables
const port: Number = Number(process.env.PORT) || 8000;
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

// Initiate our app
const app = express();

// Configure our app
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser())

if (isDevelopment) {
  app.use(require('morgan')('dev'));
  app.use(errorHandler());
  app.use(morgan('dev'));
}

// Configure Mongoose
mongoose.connect(
  process.env[`MONGOOSE_DB_URL_${isProduction ? 'PROD' : 'DEV'}`] || '',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

mongoose.set('useFindAndModify', true);

if (isDevelopment) {
  mongoose.set('debug', true);
}

// Models & routes
app.use(routes);

// Error handlers & middlewares
app.use((err: { status: number, message: string }, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
