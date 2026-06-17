-- ========================================
-- USERS
-- ========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('user', 'admin', 'soc')) NOT NULL,
    department TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_role ON users(role);



-- ========================================
-- CAMPAIGNS
-- ========================================
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,

    difficulty TEXT CHECK (
        difficulty IN ('easy', 'medium', 'hard', 'expert')
    ) NOT NULL,

    campaign_type TEXT NOT NULL,

    target_type TEXT CHECK (
        target_type IN ('organization', 'department', 'specific_users')
    ) NOT NULL DEFAULT 'organization',

    target_department TEXT,

    emails_per_user INTEGER NOT NULL,
    phishing_ratio FLOAT CHECK (phishing_ratio >= 0 AND phishing_ratio <= 1),

    active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaigns_active ON campaigns(active);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at);

-----------------------------------------
------------------------------------------

CREATE TABLE campaign_themes (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,

    theme_text TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaign_themes_campaign_id ON campaign_themes(campaign_id);

-- ========================================
-- CAMPAIGN USERS (ONLY for specific_users targeting)
-- ========================================
CREATE TABLE campaign_users (
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (campaign_id, user_id)
);



-- ========================================
-- GENERATED EMAILS (Per User, Per Campaign)
-- ========================================
CREATE TABLE emails (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

    subject TEXT NOT NULL,
    body TEXT NOT NULL,

    attack_metadata JSONB NOT NULL,
    is_phishing BOOLEAN NOT NULL,

    sequence_number INTEGER,
    theme_used TEXT,

    delivered BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emails_user_id ON emails(user_id);
CREATE INDEX idx_emails_campaign_id ON emails(campaign_id);
CREATE INDEX idx_emails_created_at ON emails(created_at);



-- ========================================
-- USER INTERACTIONS
-- ========================================
CREATE TABLE interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    email_id INTEGER REFERENCES emails(id) ON DELETE CASCADE,

    action TEXT CHECK (
        action IN ('opened', 'clicked', 'downloaded', 'reported', 'ignored')
    ) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_email_id ON interactions(email_id);
CREATE INDEX idx_interactions_created_at ON interactions(created_at);



-- ========================================
-- RISK PROFILES (Adaptive Agent Logic)
-- ========================================
CREATE TABLE risk_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    risk_score INTEGER DEFAULT 5 CHECK (risk_score BETWEEN 0 AND 100),
    trend TEXT CHECK (trend IN ('improving', 'stable', 'worsening' , 'critical')),
    total_clicks INTEGER DEFAULT 0,
    total_reports INTEGER DEFAULT 0,
    total_emails INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- ========================================
-- EXPLANATIONS (XAI)
-- ========================================
-- CREATE TABLE explanations (
--     id SERIAL PRIMARY KEY,
--     email_id INTEGER REFERENCES emails(id) ON DELETE CASCADE,
--     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

--     explanation JSONB NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

CREATE TABLE explanations (
    id SERIAL PRIMARY KEY,
    email_id INTEGER REFERENCES emails(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

    explanation JSONB NOT NULL,

    -- 🔥 ADD THIS
    ai_message TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_explanations_user_id ON explanations(user_id);



-- ========================================
-- AUDIT LOGS
-- ========================================
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    service TEXT NOT NULL,
    action TEXT NOT NULL,
    actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_service ON audit_logs(service);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);


-- ALTER EXISTING
ALTER TABLE users 
ADD COLUMN must_change_password BOOLEAN DEFAULT FALSE;

-- NEW TABLE 1: Org Style Profile
CREATE TABLE org_style_profile (
    id SERIAL PRIMARY KEY,
    greeting_style TEXT,
    signoff_style TEXT,
    tone TEXT,
    common_phrases JSONB,
    raw_sample_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NEW TABLE 2: Phishing Patterns (from corpus)
CREATE TABLE phishing_patterns (
    id SERIAL PRIMARY KEY,
    attack_type TEXT NOT NULL,
    lure_type TEXT NOT NULL,
    urgency_phrases JSONB,
    target_sector TEXT,
    difficulty_level TEXT,
    effectiveness_score FLOAT DEFAULT 0.5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NEW TABLE 3: Training Content
CREATE TABLE training_content (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content_type TEXT CHECK (
        content_type IN ('pdf','video','article','quiz')
    ),
    file_path TEXT,
    w3_content TEXT,
    topic TEXT,
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);