# DD IoT Validator - API Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently no authentication required (add JWT for production)

## Common Response Format

### Success (2xx)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success message",
  "data": { /* response data */ }
}
```

### Error (4xx/5xx)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": ["Detailed error info"]
}
```

---

## Endpoints

### 1. Upload Resume

**POST** `/candidates/upload`

Upload a resume PDF and create a new candidate profile.

#### Request
```
Content-Type: multipart/form-data

Parameters:
- email (string, required): Candidate email
- fullName (string, required): Candidate full name
- resume (file, required): PDF file, max 5MB
```

#### cURL Example
```bash
curl -X POST http://localhost:5000/api/candidates/upload \
  -F "email=john@example.com" \
  -F "fullName=John Doe" \
  -F "resume=@resume.pdf"
```

#### JavaScript Example
```javascript
const formData = new FormData();
formData.append('email', 'john@example.com');
formData.append('fullName', 'John Doe');
formData.append('resume', resumeFile);

const response = await fetch('/api/candidates/upload', {
  method: 'POST',
  body: formData,
});
```

#### Response (201 Created)
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Resume processed successfully",
  "data": {
    "candidateId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "fullName": "John Doe",
    "analysis": {
      "yearsOfExperience": 5,
      "educationLevel": "Bachelor's",
      "technologies": ["Python", "Arduino", "MQTT", "C++"],
      "iotRelevanceScore": 0.85,
      "strengths": "Strong embedded systems background..."
    },
    "resumeScores": {
      "hardware": 8,
      "programming": 7
    }
  }
}
```

#### Status Codes
- `201` - Resume processed successfully
- `400` - Invalid input (email, name, or file)
- `413` - File too large (> 5MB)
- `500` - Server error

---

### 2. Get Candidate Profile

**GET** `/candidates/:candidateId`

Retrieve candidate information and resume analysis.

#### Request
```
Parameters:
- candidateId (UUID, required): Candidate ID from upload response
```

#### cURL Example
```bash
curl http://localhost:5000/api/candidates/550e8400-e29b-41d4-a716-446655440000
```

#### Response (200 OK)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "candidate": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "full_name": "John Doe",
      "status": "in_progress",
      "created_at": "2026-04-15T10:30:00Z"
    },
    "analysis": {
      "yearsOfExperience": 5,
      "educationLevel": "Bachelor's",
      "technologies": ["Python", "Arduino", "MQTT"],
      "iotRelevanceScore": 0.85
    },
    "skills": [
      {"skill_name": "Python", "proficiency_level": "advanced"},
      {"skill_name": "Arduino", "proficiency_level": "intermediate"}
    ]
  }
}
```

---

### 3. Get Next Interview Question

**POST** `/candidates/:candidateId/next-question`

Request the next interview question. Difficulty adapts based on previous answers.

#### Request
```
Parameters:
- candidateId (UUID, required): Candidate ID
```

#### cURL Example
```bash
curl -X POST http://localhost:5000/api/candidates/550e8400-e29b-41d4-a716-446655440000/next-question
```

#### Response (200 OK)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "questionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "questionNumber": 1,
    "question": "What experience do you have with IoT systems or embedded devices?",
    "type": "technical",
    "difficulty": 3
  }
}
```

#### Status Codes
- `200` - Question generated successfully
- `400` - Interview complete (10 questions max)
- `404` - Candidate not found

---

### 4. Submit Interview Answer

**POST** `/candidates/:candidateId/submit-answer`

Submit an answer to the current question and get evaluation.

#### Request
```json
{
  "questionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "answer": "I've worked extensively with Arduino and Raspberry Pi for IoT projects..."
}
```

#### cURL Example
```bash
curl -X POST http://localhost:5000/api/candidates/550e8400-e29b-41d4-a716-446655440000/submit-answer \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "answer": "I have 3 years of IoT experience..."
  }'
```

#### JavaScript Example
```javascript
const response = await fetch(
  `/api/candidates/${candidateId}/submit-answer`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      questionId: questionId,
      answer: userAnswer
    })
  }
);
const result = await response.json();
```

#### Response (201 Created)
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Answer evaluated successfully",
  "data": {
    "answerId": "e5f8a9b0-12cd-4e8f-ba67-9c1d4e5f8a9b",
    "score": 7,
    "feedback": "Good explanation of IoT experience. Could elaborate more on specific projects.",
    "communication": 7,
    "technical": 8,
    "strengths": "Clear articulation of experience and projects",
    "improvements": "Provide more technical details about your implementation approach"
  }
}
```

#### Status Codes
- `201` - Answer evaluated
- `400` - Invalid answer or question ID
- `404` - Question not found

---

### 5. Finalize Interview

**POST** `/candidates/:candidateId/finalize`

Complete the interview and calculate final scores.

#### Request
```
Parameters:
- candidateId (UUID, required): Candidate ID
```

#### cURL Example
```bash
curl -X POST http://localhost:5000/api/candidates/550e8400-e29b-41d4-a716-446655440000/finalize
```

#### Response (200 OK)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "scores": {
      "hardware": 8,
      "programming": 7,
      "problemSolving": 7.5,
      "communication": 8,
      "totalScore": 30.5,
      "decision": "SELECTED",
      "reason": "Excellent fit for IoT role. Strong scores across all metrics..."
    },
    "report": {
      "summary": {
        "totalScore": 30.5,
        "decision": "SELECTED",
        "reason": "..."
      },
      "breakdown": {
        "hardware": {
          "score": 8,
          "source": "Resume Analysis",
          "details": "IoT Relevance: 80%"
        },
        /* ... more details */
      },
      "strengths": "Strong embedded systems knowledge...",
      "weaknesses": "Could improve documentation skills...",
      "recommendations": [
        "Ready for immediate onboarding",
        "Consider for senior projects given strong performance"
      ]
    },
    "questionsAnswered": 10
  }
}
```

#### Status Codes
- `200` - Interview finalized successfully
- `400` - Resume analysis not found
- `404` - Candidate not found

---

### 6. Get Results

**GET** `/candidates/:candidateId/results`

Retrieve final evaluation results and detailed report.

#### Request
```
Parameters:
- candidateId (UUID, required): Candidate ID
```

#### cURL Example
```bash
curl http://localhost:5000/api/candidates/550e8400-e29b-41d4-a716-446655440000/results
```

#### Response (200 OK)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "summary": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe",
      "email": "john@example.com",
      "status": "selected",
      "years_of_experience": 5,
      "education_level": "Bachelor's",
      "iot_relevance_score": 0.85,
      "hardware_score": 8,
      "programming_score": 7,
      "problem_solving_score": 7.5,
      "communication_score": 8,
      "total_score": 30.5,
      "final_decision": "SELECTED"
    },
    "scores": {
      "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "hardware_score": 8,
      "programming_score": 7,
      "problem_solving_score": 7.5,
      "communication_score": 8,
      "total_score": 30.5,
      "final_decision": "SELECTED",
      "decision_reason": "Excellent fit for IoT role..."
    },
    "analysis": {
      "yearsOfExperience": 5,
      "educationLevel": "Bachelor's",
      "iotRelevanceScore": 0.85,
      "strengths": "Strong embedded systems knowledge, 5+ years experience",
      "weaknesses": "Limited experience with cloud IoT platforms"
    }
  }
}
```

---

## Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request parameters and format |
| 404 | Not Found | Verify candidate ID or resource exists |
| 413 | Payload Too Large | Resume file exceeds 5MB limit |
| 429 | Too Many Requests | Rate limit exceeded (100 req/min) |
| 500 | Internal Server Error | Check server logs |

---

## Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`
- **Response**: HTTP 429 when exceeded

---

## Workflow Example (Complete Journey)

### Step 1: Upload Resume
```bash
POST /candidates/upload
Response: candidateId = "550e8400..."
```

### Step 2: Get Question
```bash
POST /candidates/550e8400-e29b-41d4-a716-446655440000/next-question
Response: questionId = "f47ac10b-...", questionNumber = 1
```

### Step 3: Answer Question (×10)
```bash
POST /candidates/550e8400-e29b-41d4-a716-446655440000/submit-answer
```

### Step 4: Finalize
```bash
POST /candidates/550e8400-e29b-41d4-a716-446655440000/finalize
Response: scores, decision, report
```

### Step 5: Download Results
```bash
GET /candidates/550e8400-e29b-41d4-a716-446655440000/results
```

---

## Health Check

**GET** `/health`

Check API server status.

#### Response
```json
{
  "status": "ok",
  "timestamp": "2026-04-15T10:30:00Z",
  "environment": "development"
}
```

---

## Best Practices

1. **Always validate email format** before upload
2. **Resume PDF should be clear and well-formatted**
3. **Wait for each question** before requesting next
4. **Store questionId** to submit answer
5. **Handle 400 errors** gracefully in frontend
6. **Implement retry logic** for network failures
7. **Cache results** on frontend to reduce API calls

---

Generated: April 15, 2026 | Version: 1.0
