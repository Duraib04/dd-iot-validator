# DD IoT Solutions - Candidate Validation System

A full-stack web application for automating candidate evaluation through AI-powered resume analysis and technical interviews.

## 🚀 Features

- **Resume Upload & Parsing**: Extract skills, projects, and technologies from PDF resumes
- **AI Interview**: Dynamic 5-10 question technical and behavioral interview
- **Adaptive Difficulty**: Questions adjust based on candidate responses
- **4-Metric Scoring**: Hardware, Programming, Problem-solving, Communication
- **Final Decision**: Selected (>30), Needs Training (20-30), Rejected (<20)

## 📋 Tech Stack

- **Frontend**: React 18 + Tailwind CSS + Vite
- **Backend**: Node.js + Express
- **AI**: OpenAI API (GPT-4)
- **Database**: Supabase (PostgreSQL)
- **PDF Processing**: pdfjs-dist + pdfparse

## 📁 Project Structure

```
dd-iot-validator/
├── frontend/                 # React application
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── services/        # API services
│   │   └── hooks/           # Custom hooks
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Custom middleware
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Configuration
│   ├── package.json
│   └── .env.example
├── database/                # Database setup
│   └── schema.sql           # PostgreSQL schema
└── README.md
```

## 🛠️ Quick Start

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your credentials
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔑 Environment Variables

**Backend (.env)**:
```
NODE_ENV=development
PORT=5000
OPENAI_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
CORS_ORIGIN=http://localhost:5173
```

## 📊 Scoring Breakdown

| Category | Weight | Max Score |
|----------|--------|-----------|
| Hardware Knowledge | 25% | 10 |
| Programming | 25% | 10 |
| Problem-solving | 25% | 10 |
| Communication | 25% | 10 |
| **Total** | - | **40** |

**Decision Logic**:
- **Selected**: Score > 30
- **Needs Training**: 20-30
- **Rejected**: < 20

## 🎯 API Endpoints

- `POST /api/candidates/upload` - Upload resume
- `POST /api/candidates/:id/next-question` - Get next interview question
- `POST /api/candidates/:id/submit-answer` - Submit interview answer
- `GET /api/candidates/:id/results` - Get final scoring results
