const express = require('express');
const { createClient } = require('@supabase/supabase-js');
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

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test Supabase connection
async function initializeDatabase() {
    try {
        // Test connection by querying the questions table
        const { data, error } = await supabase
            .from('questions')
            .select('count', { count: 'exact', head: true });
        
        if (error) {
            console.log('Note: Tables may not exist yet, that\'s okay');
        }
        
        console.log(' Connected to Supabase successfully!');
        console.log(' You can now create tables in your Supabase dashboard.');
    } catch (err) {
        console.error(' Supabase connection error:', err.message);
        console.log('Please check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file');
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
        // Insert into database using Supabase
        const { data, error } = await supabase
            .from('questions')
            .insert([
                {
                    question_name: questionName,
                    question_link: questionLink,
                    type: type,
                    difficulty: difficulty
                }
            ])
            .select();
        
        if (error) {
            console.error('Database error:', error.message);
            return res.status(500).json({ 
                error: 'Failed to save question to database' 
            });
        }
        
        const newId = data[0].id;
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
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Database error:', error.message);
            return res.status(500).json({ 
                error: 'Failed to retrieve questions' 
            });
        }
        
        res.json(data);
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
    
    try {
        let query = supabase
            .from('questions')
            .select('*');
        
        // Apply filters if provided
        if (type) {
            query = query.eq('type', type);
        }
        
        if (difficulty) {
            query = query.eq('difficulty', difficulty);
        }
        
        // Order by created_at descending
        query = query.order('created_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) {
            console.error('Database error:', error.message);
            return res.status(500).json({ 
                error: 'Failed to retrieve questions' 
            });
        }
        
        res.json(data);
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
        const { data, error } = await supabase
            .from('questions')
            .update({
                question_name: questionName,
                question_link: questionLink,
                type: type,
                difficulty: difficulty
            })
            .eq('id', id)
            .select();
        
        if (error) {
            console.error('Database error:', error.message);
            return res.status(500).json({ 
                error: 'Failed to update question' 
            });
        }
        
        if (data.length === 0) {
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
        const { data, error } = await supabase
            .from('questions')
            .delete()
            .eq('id', id)
            .select();
        
        if (error) {
            console.error('Database error:', error.message);
            return res.status(500).json({ 
                error: 'Failed to delete question' 
            });
        }
        
        if (data.length === 0) {
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
    console.log('✅ Server shut down gracefully');
    process.exit(0);
});

// *******************************************************************
//                        AUTHENTICATION ROUTES                       
// *******************************************************************

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();
        
        if (error || !data) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = data;
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
        const { data, error } = await supabase
            .from('user_progress')
            .select('question_id, is_solved')
            .eq('user_id', userId);
        
        if (error) {
            console.error('Error fetching user progress:', error.message);
            return res.status(500).json({ error: 'Failed to fetch progress' });
        }
        
        res.json(data);
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

        const { data, error } = await supabase
            .from('user_progress')
            .select('question_id, is_solved')
            .eq('user_id', userId);
        
        if (error) {
            console.error('Error fetching user progress:', error.message);
            return res.status(500).json({ error: 'Failed to fetch progress' });
        }
        
        res.json(data);
    } catch (err) {
        console.error('Error fetching user progress:', err.message);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

// Update user progress (mark as solved/unsolved)
app.post('/api/progress', async (req, res) => {
    const { userId, questionId, isSolved } = req.body;

    try {
        const now = new Date().toISOString();
        
        const { data, error } = await supabase
            .from('user_progress')
            .upsert({
                user_id: userId,
                question_id: questionId,
                is_solved: isSolved,
                solved_at: now
            }, {
                onConflict: 'user_id,question_id'
            })
            .select();
        
        if (error) {
            console.error('Error updating user progress:', error.message);
            return res.status(500).json({ error: 'Failed to update progress' });
        }
        
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
        const { data, error } = await supabase
            .from('users')
            .select('id, username, full_name, leetcode_username, geeksforgeeks_username, created_at')
            .eq('id', id)
            .single();
        
        if (error || !data) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(data);
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
        const { data, error } = await supabase
            .from('users')
            .update({
                full_name: fullName,
                leetcode_username: leetcodeUsername,
                geeksforgeeks_username: geeksforgeeksUsername
            })
            .eq('id', id)
            .select();
        
        if (error) {
            console.error('Error updating user profile:', error.message);
            return res.status(500).json({ error: 'Failed to update user profile' });
        }
        
        if (data.length === 0) {
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

// Get leaderboard data using Supabase
app.get('/api/leaderboard', async (req, res) => {
    const { period } = req.query; // daily, weekly, all-time

    try {
        // Get all users with role 'user'
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, username, full_name')
            .eq('role', 'user');

        if (usersError) {
            console.error('Error fetching users:', usersError.message);
            return res.status(500).json({ error: 'Failed to fetch leaderboard' });
        }

        // Get total questions count
        const { count: totalQuestions, error: questionsError } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true });

        if (questionsError) {
            console.error('Error fetching questions count:', questionsError.message);
            return res.status(500).json({ error: 'Failed to fetch leaderboard' });
        }

        // Build leaderboard data
        const leaderboard = [];

        for (const user of users) {
            let progressQuery = supabase
                .from('user_progress')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_solved', true);

            // Apply time filtering if specified
            if (period === 'daily') {
                const today = new Date().toISOString().slice(0, 10);
                progressQuery = progressQuery.gte('solved_at', today);
            } else if (period === 'weekly') {
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
                progressQuery = progressQuery.gte('solved_at', weekAgo);
            }

            const { count: solvedCount, error: progressError } = await progressQuery;

            if (progressError) {
                console.error('Error fetching user progress:', progressError.message);
                continue; // Skip this user but continue with others
            }

            const successRate = totalQuestions > 0 ? 
                Math.round((solvedCount / totalQuestions) * 100 * 100) / 100 : 0;

            leaderboard.push({
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                solved_count: solvedCount || 0,
                success_rate: successRate
            });
        }

        // Sort by solved_count descending, then by username ascending
        leaderboard.sort((a, b) => {
            if (b.solved_count !== a.solved_count) {
                return b.solved_count - a.solved_count;
            }
            return a.username.localeCompare(b.username);
        });

        // Add rank and limit to 50
        const rankedLeaderboard = leaderboard
            .slice(0, 50)
            .map((user, index) => ({
                ...user,
                rank: index + 1
            }));

        res.json(rankedLeaderboard);
    } catch (err) {
        console.error('Error fetching leaderboard:', err.message);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});
