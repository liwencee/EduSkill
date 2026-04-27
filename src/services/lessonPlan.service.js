const OpenAI = require('openai');
const config = require('../config');
const logger = require('../utils/logger');

let openaiClient = null;

function getClient() {
  if (!openaiClient && config.openai.apiKey) {
    openaiClient = new OpenAI({ apiKey: config.openai.apiKey });
  }
  return openaiClient;
}

const NERDC_CONTEXT = `
You are an expert Nigerian curriculum designer trained on the NERDC (Nigerian Educational Research
and Development Council) curriculum framework. Generate lesson plans aligned to Nigerian educational
standards for JSS1–SS3 and vocational/technical levels.
`;

async function generate({ topic, gradeLevel, subject, duration, learningObjectives = [], userId }) {
  const client = getClient();

  if (!client) {
    logger.warn('OpenAI not configured — returning mock lesson plan');
    return mockLessonPlan({ topic, gradeLevel, subject, duration });
  }

  const objectivesText = learningObjectives.length
    ? `Learning objectives: ${learningObjectives.join('; ')}`
    : '';

  const prompt = `
${NERDC_CONTEXT}

Generate a detailed ${duration}-minute lesson plan for:
- Subject: ${subject}
- Grade/Level: ${gradeLevel}
- Topic: ${topic}
${objectivesText}

Return a JSON object with these fields:
{
  "title": string,
  "subject": string,
  "gradeLevel": string,
  "duration": number,
  "learningObjectives": string[],
  "materials": string[],
  "introduction": { "duration": number, "activity": string },
  "mainActivity": { "duration": number, "steps": string[] },
  "assessment": { "duration": number, "method": string },
  "conclusion": { "duration": number, "summary": string },
  "homework": string,
  "nercAlignment": string
}
`.trim();

  const response = await client.chat.completions.create({
    model: config.openai.model,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 1500,
  });

  let plan;
  try {
    plan = JSON.parse(response.choices[0].message.content);
  } catch {
    throw new Error('Failed to parse AI lesson plan response');
  }

  logger.info('Lesson plan generated via OpenAI', { userId, topic, model: config.openai.model });
  return plan;
}

function mockLessonPlan({ topic, gradeLevel, subject, duration }) {
  return {
    title: `${subject}: ${topic}`,
    subject,
    gradeLevel,
    duration,
    learningObjectives: [
      `Students will understand the key concepts of ${topic}`,
      `Students will apply ${topic} knowledge in practical scenarios`,
    ],
    materials: ['Textbook', 'Whiteboard', 'Marker', 'Worksheet'],
    introduction: { duration: Math.floor(duration * 0.1), activity: `Introduce ${topic} with a real-world Nigerian example` },
    mainActivity: {
      duration: Math.floor(duration * 0.6),
      steps: ['Explain core concepts', 'Demonstrate with examples', 'Group practice activity', 'Individual exercise'],
    },
    assessment: { duration: Math.floor(duration * 0.2), method: 'Short quiz and peer discussion' },
    conclusion: { duration: Math.floor(duration * 0.1), summary: `Recap key points of ${topic} and preview next lesson` },
    homework: `Research one real-world application of ${topic} in Nigeria`,
    nercAlignment: `Aligned to NERDC ${subject} curriculum for ${gradeLevel}`,
  };
}

module.exports = { generate };
