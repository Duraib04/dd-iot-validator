import OpenAI from 'openai';
import config from '../config/index.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

const RESUME_EXTRACTION_PROMPT = `You are an expert HR analyst for IoT companies. Analyze the resume text and extract information in JSON format.

Please extract and return ONLY valid JSON (no markdown, no explanation):
{
  "yearsOfExperience": <number>,
  "educationLevel": "<string: High School, Bachelor's, Master's, PhD>",
  "technologies": ["<tech1>", "<tech2>", ...],
  "projects": ["<project1>", "<project2>", ...],
  "strengths": "<string summarizing key strengths relevant to IoT>",
  "weaknesses": "<string summarizing areas for improvement>",
  "iotRelevanceScore": <0-1 float, how relevant is this candidate for IoT roles>,
  "skills": [
    {"name": "<skill>", "level": "<beginner|intermediate|advanced>", "confidence": <0-1>},
    ...
  ]
}

Resume Text:
`;

export const resumeService = {
  /**
   * Calculate IoT relevance based on keywords found
   */
  calculateIoTRelevance(resumeText, technologies) {
    const iotKeywords = [
      'iot', 'internet of things', 'embedded', 'firmware', 'microcontroller',
      'arduino', 'raspberry pi', 'esp32', 'mqtt', 'ble', 'bluetooth',
      'zigbee', 'lorawan', 'sensors', 'hardware', 'pcb', 'rtos',
      'edge computing', 'iot protocol', 'device management', 'telemetry',
      'connectivity', 'wireless', 'rf', 'gnss', 'gps', 'can bus',
      'modbus', 'profibus', 'industrial', 'real-time', 'c++', 'c',
      'python', 'linux', 'rtc', 'dsp', 'signal processing'
    ];

    const text = resumeText.toLowerCase();
    let relevanceScore = 0;
    let keywordMatches = 0;

    iotKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        keywordMatches++;
        relevanceScore += 0.05; // Each keyword adds 5%
      }
    });

    // Bonus for relevant technologies
    const relevantTechs = ['arduino', 'raspberry', 'esp', 'mqtt', 'ble', 'embedded'];
    technologies?.forEach(tech => {
      if (relevantTechs.some(t => tech.toLowerCase().includes(t))) {
        relevanceScore += 0.1;
      }
    });

    return Math.min(relevanceScore, 1.0); // Cap at 1.0
  },

  /**
   * Extract resume information using OpenAI
   */
  async extractResumeInfo(resumeText) {
    try {
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
      
      // Parse JSON response
      const analysis = JSON.parse(content);

      // Add AI-calculated IoT relevance if not present
      if (!analysis.iotRelevanceScore) {
        analysis.iotRelevanceScore = this.calculateIoTRelevance(
          resumeText,
          analysis.technologies
        );
      }

      return {
        yearsOfExperience: analysis.yearsOfExperience || 0,
        educationLevel: analysis.educationLevel || 'Unknown',
        technologies: analysis.technologies || [],
        projects: analysis.projects || [],
        strengths: analysis.strengths || '',
        weaknesses: analysis.weaknesses || '',
        iotRelevanceScore: analysis.iotRelevanceScore,
        skills: analysis.skills || [],
      };
    } catch (error) {
      console.error('Resume extraction error:', error);
      throw new Error(`Failed to extract resume information: ${error.message}`);
    }
  },

  /**
   * Score resume against IoT role fit
   */
  scoreResume(analysis) {
    let hardwareScore = 0;
    let programmingScore = 0;

    const hardwareKeywords = ['arduino', 'embedded', 'microcontroller', 'pcb', 'iot', 'sensors', 'hardware', 'fpga'];
    const programmingKeywords = ['python', 'c++', 'c', 'java', 'javascript', 'rust'];

    analysis.technologies?.forEach(tech => {
      const techLower = tech.toLowerCase();
      if (hardwareKeywords.some(kw => techLower.includes(kw))) hardwareScore += 2;
      if (programmingKeywords.some(kw => techLower.includes(kw))) programmingScore += 2;
    });

    analysis.skills?.forEach(skill => {
      const skillLower = skill.name.toLowerCase();
      if (hardwareKeywords.some(kw => skillLower.includes(kw))) {
        hardwareScore += skill.level === 'advanced' ? 3 : skill.level === 'intermediate' ? 2 : 1;
      }
      if (programmingKeywords.some(kw => skillLower.includes(kw))) {
        programmingScore += skill.level === 'advanced' ? 3 : skill.level === 'intermediate' ? 2 : 1;
      }
    });

    return {
      hardware: Math.min(hardwareScore, 10),
      programming: Math.min(programmingScore, 10),
    };
  },
};

export default resumeService;
