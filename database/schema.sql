-- DD IoT Solutions Candidate Validation Database Schema
-- PostgreSQL for Supabase

-- Candidates Table
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    resume_url TEXT,
    resume_text TEXT,
    status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, completed, rejected, selected, training
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Extracted Skills Table
CREATE TABLE candidate_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(50), -- beginner, intermediate, advanced
    confidence_score FLOAT, -- 0-1, confidence of extraction
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(candidate_id, skill_name)
);

-- Interview Questions Table (store questions asked)
CREATE TABLE interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    question_number INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50), -- technical, behavioral
    difficulty_level INT DEFAULT 5, -- 1-10 scale
    created_at TIMESTAMP DEFAULT NOW()
);

-- Interview Answers Table
CREATE TABLE interview_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    score FLOAT, -- 0-10
    feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Scoring Table
CREATE TABLE candidate_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    hardware_score FLOAT DEFAULT 0, -- 0-10
    programming_score FLOAT DEFAULT 0, -- 0-10
    problem_solving_score FLOAT DEFAULT 0, -- 0-10
    communication_score FLOAT DEFAULT 0, -- 0-10
    total_score FLOAT GENERATED ALWAYS AS (
        (hardware_score + programming_score + problem_solving_score + communication_score)
    ) STORED,
    final_decision VARCHAR(50), -- selected, training, rejected
    decision_reason TEXT,
    evaluated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(candidate_id)
);

-- Resume Analysis Table (store AI extraction metadata)
CREATE TABLE resume_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    years_of_experience INT,
    education_level VARCHAR(100),
    technologies TEXT[], -- array of technologies found
    projects TEXT[], -- array of projects mentioned
    strengths TEXT,
    weaknesses TEXT,
    iot_relevance_score FLOAT, -- 0-1
    analysis_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, error
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(candidate_id)
);

-- Indexes for performance
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_created_at ON candidates(created_at DESC);
CREATE INDEX idx_candidate_skills_candidate_id ON candidate_skills(candidate_id);
CREATE INDEX idx_interview_questions_candidate_id ON interview_questions(candidate_id);
CREATE INDEX idx_interview_answers_candidate_id ON interview_answers(candidate_id);
CREATE INDEX idx_candidate_scores_candidate_id ON candidate_scores(candidate_id);
CREATE INDEX idx_resume_analysis_candidate_id ON resume_analysis(candidate_id);

-- Enable RLS (Row Level Security) for multi-tenancy if needed
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_analysis ENABLE ROW LEVEL SECURITY;

-- Create view for candidate summary
CREATE VIEW candidate_summary AS
SELECT
    c.id,
    c.full_name,
    c.email,
    c.status,
    ra.years_of_experience,
    ra.education_level,
    ra.iot_relevance_score,
    cs.hardware_score,
    cs.programming_score,
    cs.problem_solving_score,
    cs.communication_score,
    cs.total_score,
    cs.final_decision,
    c.created_at
FROM candidates c
LEFT JOIN resume_analysis ra ON c.id = ra.candidate_id
LEFT JOIN candidate_scores cs ON c.id = cs.candidate_id;
