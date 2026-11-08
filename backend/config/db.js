const mongoose = require('mongoose');

/**
 * Shared MongoDB Connection Utility
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillnest');
    console.log(`[SkillNest DB Connected]: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[SkillNest DB Connection Error]: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
