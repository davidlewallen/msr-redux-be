import mongoose from 'mongoose';


export const initializeDatabase = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  const DB_PASSWORD = process.env.MONGO_ATLAS_PASSWORD

  if (!DB_PASSWORD) {
    return console.error('ERROR: Cannot find username and/or password for database. Update .env file with MLAB_USERNAME and/or MLAB_PASSWORD')
  }

  const DB_URI = process.env[`MONGO_ATLAS_${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`] || ''
  const DB_URI_WITH_CREDS = DB_URI.replace('<password>', encodeURIComponent(DB_PASSWORD));

  mongoose.connect(DB_URI_WITH_CREDS, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  })

  if (!isProduction) {
    mongoose.set('debug', true)
  }
}

