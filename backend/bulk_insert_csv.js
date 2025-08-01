const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');
require('dotenv').config();

// Initialize PostgreSQL connection pool
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

async function insertQuestionsFromCSV() {
    const questions = [];
    
    console.log('Reading CSV file...');
    
    return new Promise((resolve, reject) => {
        fs.createReadStream('questions.csv')
            .pipe(csv({
                skipEmptyLines: true,
                mapHeaders: ({ header }) => header.replace(/\uFEFF/g, '').trim() // Remove BOM
            }))
            .on('data', (row) => {
                // Clean up the data and normalize case
                const questionName = row.question_name?.trim();
                const questionLink = row.question_link?.trim();
                let type = row.type?.trim();
                let difficulty = row.difficulty?.trim();
                
                // Skip empty rows or invalid data
                if (!questionName || !questionLink || !type || !difficulty) {
                    return;
                }
                
                // Normalize type values
                type = type.toLowerCase();
                if (type === 'classwork') {
                    type = 'classwork';
                } else if (type === 'homework') {
                    type = 'homework';
                } else {
                    console.log(`Skipping invalid type: ${type} for question: ${questionName}`);
                    return;
                }
                
                // Normalize difficulty values
                difficulty = difficulty.toLowerCase();
                if (difficulty === 'easy') {
                    difficulty = 'easy';
                } else if (difficulty === 'medium') {
                    difficulty = 'medium';
                } else if (difficulty === 'hard') {
                    difficulty = 'hard';
                } else {
                    console.log(`Skipping invalid difficulty: ${difficulty} for question: ${questionName}`);
                    return;
                }
                
                questions.push({
                    question_name: questionName,
                    question_link: questionLink,
                    type: type,
                    difficulty: difficulty
                });
            })
            .on('end', async () => {
                console.log(`Parsed ${questions.length} questions from CSV`);
                
                try {
                    const client = await pool.connect();
                    console.log('Connected to database');
                    
                    let successCount = 0;
                    let errorCount = 0;
                    
                    // Insert questions one by one to handle any duplicates or errors
                    for (let i = 0; i < questions.length; i++) {
                        const question = questions[i];
                        
                        try {
                            const sql = `INSERT INTO questions (question_name, question_link, type, difficulty) 
                                        VALUES ($1, $2, $3, $4) RETURNING id`;
                            
                            const result = await client.query(sql, [
                                question.question_name,
                                question.question_link,
                                question.type,
                                question.difficulty
                            ]);
                            
                            successCount++;
                            console.log(`✓ Inserted question ${i + 1}: "${question.question_name}" (ID: ${result.rows[0].id})`);
                            
                        } catch (err) {
                            errorCount++;
                            console.error(`✗ Error inserting question ${i + 1} "${question.question_name}": ${err.message}`);
                        }
                    }
                    
                    client.release();
                    console.log(`\n=== BULK INSERT COMPLETE ===`);
                    console.log(`Successfully inserted: ${successCount} questions`);
                    console.log(`Errors: ${errorCount} questions`);
                    console.log(`Total processed: ${questions.length} questions`);
                    
                    resolve();
                    
                } catch (err) {
                    console.error('Database connection error:', err.message);
                    reject(err);
                }
            })
            .on('error', (err) => {
                console.error('CSV parsing error:', err.message);
                reject(err);
            });
    });
}

// Run the script
async function main() {
    try {
        await insertQuestionsFromCSV();
        console.log('\nScript completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Script failed:', err.message);
        process.exit(1);
    }
}

main();
