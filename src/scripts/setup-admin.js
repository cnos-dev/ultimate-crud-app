#!/usr/bin/env node
/**
 * Setup Default Admin User
 * Creates a default admin user for the Ultimate CRUD application
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');
const { hashPassword } = require('./middleware/auth');

// Database configuration
const dbConfig = {
  dialect: process.env.DB_DIALECT || 'sqlite',
  logging: false
};

if (dbConfig.dialect === 'sqlite') {
  dbConfig.storage = process.env.SQLITE_PATH || './blog.db';
} else {
  dbConfig.host = process.env.DB_HOST || 'localhost';
  dbConfig.port = process.env.DB_PORT || (dbConfig.dialect === 'postgres' ? 5432 : 3306);
  dbConfig.database = process.env.DB_NAME || 'ultimate_crud_blog';
  dbConfig.username = process.env.DB_USER || (dbConfig.dialect === 'postgres' ? 'postgres' : 'root');
  dbConfig.password = process.env.DB_PASS || 'password';
}

const setupAdminUser = async () => {
  let sequelize;
  
  try {
    console.log('🔐 Setting up default admin user...');
    
    sequelize = new Sequelize(dbConfig);
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Check if admin user already exists
    const [existingAdmin] = await sequelize.query(
      "SELECT id FROM users WHERE role = 'admin' OR username = 'admin' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists. Skipping setup.');
      return;
    }

    // Create default admin user
    const adminUser = {
      username: 'admin',
      email: 'admin@ultimate-crud.com',
      password: 'admin123', // Default password - should be changed immediately
      role: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      bio: 'Default system administrator account'
    };

    // Hash the password
    const hashedPassword = await hashPassword(adminUser.password);

    // Insert admin user
    const [insertResult] = await sequelize.query(
      `INSERT INTO users (username, email, password, role, firstName, lastName, bio, created_at, updated_at) 
       VALUES (:username, :email, :password, :role, :firstName, :lastName, :bio, datetime('now'), datetime('now'))`,
      {
        replacements: {
          username: adminUser.username,
          email: adminUser.email,
          password: hashedPassword,
          role: adminUser.role,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          bio: adminUser.bio
        },
        type: Sequelize.QueryTypes.INSERT
      }
    );

    console.log('✅ Default admin user created successfully!');
    console.log('');
    console.log('📋 Admin User Details:');
    console.log('   Username: admin');
    console.log('   Email: admin@ultimate-crud.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('🔴 IMPORTANT SECURITY NOTICE:');
    console.log('   Please change the default password immediately after first login!');
    console.log('');
    console.log('🚀 You can now:');
    console.log('   1. Start the server: npm start');
    console.log('   2. Login at: POST /auth/login');
    console.log('   3. Use the JWT token to access protected endpoints');
    console.log('');

  } catch (error) {
    console.error('❌ Error setting up admin user:', error.message);
    
    if (error.message.includes('no such table: users')) {
      console.log('');
      console.log('💡 It looks like the database tables haven\'t been created yet.');
      console.log('   Please run the database setup first:');
      console.log('   npm run setup');
      console.log('');
    } else if (error.message.includes('UNIQUE constraint failed')) {
      console.log('');
      console.log('💡 A user with this username or email already exists.');
      console.log('   You can check existing users in your database.');
      console.log('');
    }
    
    process.exit(1);
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
  }
};

// Run the setup
if (require.main === module) {
  setupAdminUser()
    .then(() => {
      console.log('🎉 Admin user setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = { setupAdminUser };
