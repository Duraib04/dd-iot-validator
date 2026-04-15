// Vercel API Route: Upload Resume
// POST /api/upload

import { writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import pdfParse from 'pdf-parse';
import { openai, supabase } from './config.js';
import { v4 as uuidv4 } from 'uuid';

const RESUME_EXTRACTION_PROMPT = `You are an expert HR analyst for IoT companies. Analyze the resume text and extract information in JSON format.

Please extract and return ONLY valid JSON (no markdown):
{
  "yearsOfExperience": <number>,
  "educationLevel": "<string>",
  "technologies": ["<tech1>", "<tech2>"],
  "projects": ["<project1>", "<project2>"],
  "strengths": "<string>",
  "weaknesses": "<string>",
  "iotRelevanceScore": <0-1 float>,
  "skills": [
    {"name": "<skill>", "level": "<beginner|intermediate|advanced>", "confidence": <0-1>}
  ]
}

Resume Text:
`;

export default async function handler(req, res) {
  // Only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, fullName, resumeBase64 } = req.body;

    // Validate inputs
    if (!email || !fullName || !resumeBase64) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(resumeBase64, 'base64');

    // Parse PDF
    const pdfData = await pdfParse(pdfBuffer);
    const resumeText = pdfData.text || '';

    if (!resumeText.trim()) {
      return res.status(400).json({ error: 'PDF is empty or unreadable' });
    }

    // Call OpenAI to extract resume info
    const message = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: RESUME_EXTRACTION_PROMPT + resumeText,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = message.choices[0].message.content.trim();
    const analysis = JSON.parse(content);

    // Create candidate record
    const candidateId = uuidv4();
    const { error: insertError } = await supabase.from('candidates').insert([
      {
        id: candidateId,
        email,
        full_name: fullName,
        resume_text: resumeText,
        status: 'in_progress',
      },
    ]);

    if (insertError) throw insertError;

    // Store resume analysis
    await supabase.from('resume_analysis').insert([
      {
        candidate_id: candidateId,
        years_of_experience: analysis.yearsOfExperience || 0,
        education_level: analysis.educationLevel || 'Unknown',
        technologies: analysis.technologies || [],
        projects: analysis.projects || [],
        strengths: analysis.strengths || '',
        weaknesses: analysis.weaknesses || '',
        iot_relevance_score: analysis.iotRelevanceScore || 0,
        analysis_status: 'completed',
      },
    ]);

    // Calculate resume scores
    const hardware = Math.min(
      10,
      Math.round((analysis.iotRelevanceScore || 0) * 10)
    );
    const programming = Math.min(
      10,
      Math.round((analysis.yearsOfExperience || 0) * 0.5 + (analysis.technologies?.length || 0) * 0.5 + 2)
    );

    return res.status(201).json({
      success: true,
      data: {
        candidateId,
        email,
        fullName,
        analysis: {
          yearsOfExperience: analysis.yearsOfExperience,
          educationLevel: analysis.educationLevel,
          technologies: analysis.technologies,
          iotRelevanceScore: analysis.iotRelevanceScore,
        },
        resumeScores: {
          hardware,
          programming,
        },
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process resume',
    });
  }
}
