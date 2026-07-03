const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const Analysis = require('../models/Analysis');
const { PdfReader } = require('pdfreader');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Modern PDF text extraction compatible with Node 24+ using pdfreader
async function extractTextFromPDF(buffer) {
  return new Promise((resolve) => {
    if (!buffer || buffer.length === 0) {
      return resolve('Resume text could not be extracted (Empty buffer)');
    }

    let extractedText = '';
    
    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) {
        console.error('PDF parsing library error:', err.message);
        return resolve('Resume text could not be extracted');
      }
      
      if (!item) {
        return resolve(extractedText.trim() || 'Resume content text could not be processed');
      }
      
      if (item.text) {
        extractedText += item.text + ' ';
      }
    });
  });
}

// Robust JSON extraction that handles markdown blocks and messy text strings
function extractJSON(fullText) {
  if (!fullText) {
    throw new Error('AI response is completely empty');
  }

  let cleaned = fullText.replace(/```json|```/g, '').trim();
  
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  
  if (start === -1 || end === -1) {
    console.error('=> Faulty AI Output string was:', fullText);
    throw new Error('No JSON object found in AI response');
  }
  
  const jsonStr = cleaned.slice(start, end + 1);
  
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    throw new Error('Failed to parse JSON from AI response: ' + e.message);
  }
}

// POST /api/analysis/match
router.post('/match', authMiddleware, upload.single('resume'), async (req, res) => {
  // Enforce precise SSE format expected by Dashboard.tsx line parser
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  try {
    const { jobTitle, jobDescription } = req.body;
    if (!req.file || !jobDescription) {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Resume and job description required' } }] })}\n\n`);
      return res.end();
    }

    const resumeText = await extractTextFromPDF(req.file.buffer);

    const prompt = `You are an expert career coach. Analyze this resume against the job description.
Return ONLY a valid JSON object matching the schema below. Do not include any markdown formatting (like \`\`\`json), no text before, and no text after.

Schema:
{
  "matchScore": 85,
  "atsKeywordsFound": ["React", "Node.js"],
  "atsKeywordsMissing": ["TypeScript"],
  "strengths": ["Strong frontend experience"],
  "gaps": ["Lacks cloud architecture"],
  "suggestions": ["Add AWS certification"]
}

JOB TITLE: ${jobTitle || 'Not specified'}
JOB DESCRIPTION: ${jobDescription}
RESUME TEXT:
${resumeText}`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        temperature: 0.1,
      }),
    });

    if (!groqResponse.ok) {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Groq connection failed' } }] })}\n\n`);
      return res.end();
    }

    let fullText = '';
    let bufferStr = '';
    const decoder = new TextDecoder();
    const reader = groqResponse.body.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        bufferStr += decoder.decode(value, { stream: true });
        const lines = bufferStr.split('\n');
        bufferStr = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

          if (trimmedLine.startsWith('data: ')) {
            try {
              const rawJson = trimmedLine.substring(6);
              const parsed = JSON.parse(rawJson);
              const content = parsed.choices?.[0]?.delta?.content || '';
              
              if (content) {
                fullText += content;
                
                // Construct the exact nested payload layout parsed on line 178 of Dashboard.tsx
                const proxyPayload = {
                  choices: [
                    {
                      delta: {
                        content: content
                      }
                    }
                  ]
                };
                res.write(`data: ${JSON.stringify(proxyPayload)}\n\n`);
              }
            } catch (e) {
              // Ignore split chunk json line breaks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Flush terminating signals cleanly
    res.write('data: [DONE]\n\n');
    res.end();

    // Fire asynchronous background handler to save to Mongo database
    try {
      const parsed = extractJSON(fullText);
      await Analysis.create({
        user: req.userId, 
        type: 'match',
        jobTitle: jobTitle || 'Untitled',
        matchScore: parsed.matchScore || 0,
        atsKeywordsFound: parsed.atsKeywordsFound || [],
        atsKeywordsMissing: parsed.atsKeywordsMissing || [],
        strengths: parsed.strengths || [],
        gaps: parsed.gaps || [],
        suggestions: parsed.suggestions || [],
      });
      console.log('Match analysis saved to DB successfully');
    } catch (e) {
      console.error('DB tracking error on background worker:', e.message);
    }

  } catch (err) {
    console.error('Match route error:', err.message);
    if (!res.headersSent) {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Execution breakdown' } }] })}\n\n`);
      res.end();
    }
  }
});

// POST /api/analysis/score
router.post('/score', authMiddleware, upload.single('resume'), async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  try {
    if (!req.file) {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'File missing' } }] })}\n\n`);
      return res.end();
    }

    const resumeText = await extractTextFromPDF(req.file.buffer);

    const prompt = `You are an expert resume reviewer. Score this resume comprehensively.
Return ONLY a valid JSON object matching the schema below. Do not include any markdown format (such as \`\`\`json), text before, or text after.

Schema:
{
  "overallScore": 80,
  "contentScore": 75,
  "impactScore": 85,
  "keywordScore": 70,
  "formatScore": 90,
  "atsKeywordsFound": ["JavaScript"],
  "suggestions": ["Improve action verbs"]
}

RESUME TEXT:
${resumeText}`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        temperature: 0.1,
      }),
    });

    if (!groqResponse.ok) {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Groq failed' } }] })}\n\n`);
      return res.end();
    }

    let fullText = '';
    let bufferStr = '';
    const decoder = new TextDecoder();
    const reader = groqResponse.body.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        bufferStr += decoder.decode(value, { stream: true });
        const lines = bufferStr.split('\n');
        bufferStr = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

          if (trimmedLine.startsWith('data: ')) {
            try {
              const rawJson = trimmedLine.substring(6);
              const parsed = JSON.parse(rawJson);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                fullText += content;
                
                const proxyPayload = {
                  choices: [{ delta: { content: content } }]
                };
                res.write(`data: ${JSON.stringify(proxyPayload)}\n\n`);
              }
            } catch (e) {}
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    res.write('data: [DONE]\n\n');
    res.end();

    try {
      const parsed = extractJSON(fullText);
      await Analysis.create({
        user: req.userId, 
        type: 'score',
        overallScore: parsed.overallScore || 0,
        contentScore: parsed.contentScore || 0,
        impactScore: parsed.impactScore || 0,
        keywordScore: parsed.keywordScore || 0,
        formatScore: parsed.formatScore || 0,
        atsKeywordsFound: parsed.atsKeywordsFound || [],
        suggestions: parsed.suggestions || [],
      });
      console.log('Score analysis saved to DB successfully');
    } catch (e) {
      console.error("DB save error:", e.message);
    }

  } catch (err) {
    console.error('Score route error:', err.message);
    if (!res.headersSent) {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Execution failed' } }] })}\n\n`);
      res.end();
    }
  }
});

// GET /api/analysis/history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await Analysis.find({ user: req.userId })
      .sort({ createdAt: -1 }).select('-user -__v');
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/analysis/history/:id
router.delete('/history/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Analysis.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deleted) {
      return res.status(404).json({ message: 'History item not found' });
    }
    res.json({ message: 'History item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/analysis/history
router.delete('/history', authMiddleware, async (req, res) => {
  try {
    await Analysis.deleteMany({ user: req.userId });
    res.json({ message: 'History cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;