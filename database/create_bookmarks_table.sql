-- Create user_bookmarks table for storing bookmarked questions
CREATE TABLE IF NOT EXISTS user_bookmarks (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    question_id BIGINT NOT NULL,
    bookmarked_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_user_bookmarks_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_bookmarks_question_id 
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate bookmarks
    UNIQUE(user_id, question_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_question_id ON user_bookmarks(question_id);

-- Add Row Level Security (RLS)
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own bookmarks
CREATE POLICY "Users can manage their own bookmarks" ON user_bookmarks
    FOR ALL
    USING (user_id::text = auth.uid()::text)
    WITH CHECK (user_id::text = auth.uid()::text);

-- Grant permissions
GRANT ALL ON user_bookmarks TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE user_bookmarks_id_seq TO authenticated;
