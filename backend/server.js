const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(express.json());

// Initialize PostgreSQL connection pool
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection and create tables
async function initializeDatabase() {
    try {
        const client = await pool.connect();
        console.log('Connected to PostgreSQL database');
        
        // Create questions table if it doesn't exist
        await client.query(`
            CREATE TABLE IF NOT EXISTS questions (
                id SERIAL PRIMARY KEY,
                question_name VARCHAR(255) NOT NULL,
                question_link TEXT NOT NULL,
                type VARCHAR(50) NOT NULL CHECK(type IN ('homework', 'classwork')),
                difficulty VARCHAR(50) NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'user' CHECK(role IN ('admin', 'user')),
                full_name VARCHAR(100),
                leetcode_username VARCHAR(50),
                geeksforgeeks_username VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create user_progress table for tracking solved questions
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_progress (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
                is_solved BOOLEAN DEFAULT FALSE,
                solved_at TIMESTAMP,
                notes TEXT,
                UNIQUE(user_id, question_id)
            )
        `);
        
        // Insert default admin user (password: admin123)
        await client.query(`
            INSERT INTO users (username, password, role, full_name) 
            VALUES ('admin', '$2b$10$oLp/yMtigFHcJihcutF37udFOal.4SJ/T75woElqRc8kYCrc7QJge', 'admin', 'Admin User')
            ON CONFLICT (username) DO NOTHING
        `);
        
        // Insert default user (password: user123)
        await client.query(`
            INSERT INTO users (username, password, role, full_name, leetcode_username, geeksforgeeks_username) 
            VALUES ('dhruv', '$2b$10$4Qd.L1YqOQiAYylkfXvhnOIqcXOgwK7hsAco5/9tAB9Vj3R1Ivuwa', 'user', 'Dhruv Narang', 'dhruv608', 'dhruv608')
            ON CONFLICT (username) DO NOTHING
        `);
        
        console.log('Database tables ready');
        client.release();
    } catch (err) {
        console.error('Database initialization error:', err.message);
        process.exit(1);
    }
}

// Initialize database on startup
initializeDatabase();

// API Routes

// Submit question endpoint
app.post('/submit-question', async (req, res) => {
    const { questionName, questionLink, type, difficulty } = req.body;
    
    // Validate required fields
    if (!questionName || !questionLink || !type || !difficulty) {
        return res.status(400).json({ 
            error: 'All fields are required' 
        });
    }
    
    // Validate type and difficulty values
    const validTypes = ['homework', 'classwork'];
    const validDifficulties = ['easy', 'medium', 'hard'];
    
    if (!validTypes.includes(type)) {
        return res.status(400).json({ 
            error: 'Invalid type. Must be either homework or classwork' 
        });
    }
    
    if (!validDifficulties.includes(difficulty)) {
        return res.status(400).json({ 
            error: 'Invalid difficulty. Must be easy, medium, or hard' 
        });
    }
    
    try {
        // Insert into database
        const sql = `INSERT INTO questions (question_name, question_link, type, difficulty) 
                     VALUES ($1, $2, $3, $4) RETURNING id`;
        
        const result = await pool.query(sql, [questionName, questionLink, type, difficulty]);
        const newId = result.rows[0].id;
        
        console.log(`New question added with ID: ${newId}`);
        res.json({ 
            success: true, 
            id: newId,
            message: 'Question submitted successfully!' 
        });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ 
            error: 'Failed to save question to database' 
        });
    }
});

// Get all questions endpoint (for viewing stored data)
app.get('/questions', async (req, res) => {
    try {
        const sql = `SELECT * FROM questions ORDER BY created_at DESC`;
        const result = await pool.query(sql);
        res.json(result.rows);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ 
            error: 'Failed to retrieve questions' 
        });
    }
});

// Get questions by filter
app.get('/questions/filter', async (req, res) => {
    const { type, difficulty } = req.query;
    let sql = `SELECT * FROM questions WHERE 1=1`;
    let params = [];
    let paramCount = 0;
    
    if (type) {
        paramCount++;
        sql += ` AND type = $${paramCount}`;
        params.push(type);
    }
    
    if (difficulty) {
        paramCount++;
        sql += ` AND difficulty = $${paramCount}`;
        params.push(difficulty);
    }
    
    sql += ` ORDER BY created_at DESC`;
    
    try {
        const result = await pool.query(sql, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ 
            error: 'Failed to retrieve questions' 
        });
    }
});

// Update a question endpoint
app.put('/questions/:id', async (req, res) => {
    const { id } = req.params;
    const { questionName, questionLink, type, difficulty } = req.body;
    
    // Validate required fields
    if (!questionName || !questionLink || !type || !difficulty) {
        return res.status(400).json({ 
            error: 'All fields are required' 
        });
    }
    
    // Validate type and difficulty values
    const validTypes = ['homework', 'classwork'];
    const validDifficulties = ['easy', 'medium', 'hard'];
    
    if (!validTypes.includes(type)) {
        return res.status(400).json({ 
            error: 'Invalid type. Must be either homework or classwork' 
        });
    }
    
    if (!validDifficulties.includes(difficulty)) {
        return res.status(400).json({ 
            error: 'Invalid difficulty. Must be easy, medium, or hard' 
        });
    }
    
    try {
        const sql = `UPDATE questions 
                     SET question_name = $1, question_link = $2, type = $3, difficulty = $4 
                     WHERE id = $5`;
        const result = await pool.query(sql, [questionName, questionLink, type, difficulty, id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ 
                error: 'Question not found' 
            });
        }
        
        console.log(`Question with ID ${id} updated`);
        res.json({ 
            success: true, 
            message: 'Question updated successfully!' 
        });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ 
            error: 'Failed to update question' 
        });
    }
});

// Delete a question endpoint
app.delete('/questions/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const sql = `DELETE FROM questions WHERE id = $1`;
        const result = await pool.query(sql, [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ 
                error: 'Question not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Question deleted successfully!' 
        });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ 
            error: 'Failed to delete question' 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down server...');
    try {
        await pool.end();
        console.log('Database connection pool closed');
    } catch (err) {
        console.error('Error closing database pool:', err.message);
    }
    process.exit(0);
});

// *******************************************************************
//                        AUTHENTICATION ROUTES                       
// *******************************************************************

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'your_default_secret',
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.id, username: user.username, role: user.role, fullName: user.full_name } });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});


// *******************************************************************
//                        USER PROGRESS ROUTES                        
// *******************************************************************

// Get user progress for a specific user
app.get('/api/progress/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query('SELECT question_id, is_solved FROM user_progress WHERE user_id = $1', [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching user progress:', err.message);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

// Alternative route for backward compatibility
app.get('/user-progress', async (req, res) => {
    // This route requires authentication - extract userId from token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret');
        const userId = decoded.userId;

        const result = await pool.query('SELECT question_id, is_solved FROM user_progress WHERE user_id = $1', [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching user progress:', err.message);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

// Update user progress (mark as solved/unsolved)
app.post('/api/progress', async (req, res) => {
    const { userId, questionId, isSolved } = req.body;

    try {
        const now = new Date();
        const sql = `
            INSERT INTO user_progress (user_id, question_id, is_solved, solved_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, question_id)
            DO UPDATE SET is_solved = $3, solved_at = $4;
        `;

        await pool.query(sql, [userId, questionId, isSolved, now]);
        res.json({ success: true, message: 'Progress updated' });

    } catch (err) {
        console.error('Error updating user progress:', err.message);
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

// *******************************************************************
//                        USER PROFILE ROUTES                        
// *******************************************************************

// Get user profile
app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT id, username, full_name, leetcode_username, geeksforgeeks_username, created_at FROM users WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching user profile:', err.message);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// Update user profile
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { fullName, leetcodeUsername, geeksforgeeksUsername } = req.body;

    try {
        const sql = `
            UPDATE users 
            SET full_name = $1, leetcode_username = $2, geeksforgeeks_username = $3
            WHERE id = $4
        `;
        
        const result = await pool.query(sql, [fullName, leetcodeUsername, geeksforgeeksUsername, id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Error updating user profile:', err.message);
        res.status(500).json({ error: 'Failed to update user profile' });
    }
});

// *******************************************************************
//                        LEADERBOARD ROUTES                        
// *******************************************************************

// Get leaderboard data
app.get('/api/leaderboard', async (req, res) => {
    const { period } = req.query; // daily, weekly, all-time

    try {
        let sql = `
            SELECT 
                u.id,
                u.username,
                u.full_name,
                COUNT(up.question_id) as solved_count,
                ROUND(
                    (COUNT(up.question_id)::float / 
                     NULLIF((SELECT COUNT(*) FROM questions), 0) * 100), 2
                ) as success_rate
            FROM users u
            LEFT JOIN user_progress up ON u.id = up.user_id AND up.is_solved = true
        `;

        let params = [];
        
        // Add time-based filtering
        if (period === 'daily') {
            sql += ` AND up.solved_at >= CURRENT_DATE`;
        } else if (period === 'weekly') {
            sql += ` AND up.solved_at >= CURRENT_DATE - INTERVAL '7 days'`;
        }
        // For 'all-time' or no period, no additional filter needed

        sql += `
            WHERE u.role = 'user'
            GROUP BY u.id, u.username, u.full_name
            ORDER BY solved_count DESC, u.username ASC
            LIMIT 50
        `;

        const result = await pool.query(sql, params);
        
        // Add rank to each user
        const leaderboard = result.rows.map((user, index) => ({
            ...user,
            rank: index + 1
        }));

        res.json(leaderboard);
    } catch (err) {
        console.error('Error fetching leaderboard:', err.message);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});
