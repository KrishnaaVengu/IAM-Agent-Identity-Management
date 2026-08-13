import { Router } from 'express';
import Groq from 'groq-sdk';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { message, messages } = req.body;
    
    let chatMessages: any[] = [];
    
    if (messages && Array.isArray(messages)) {
      chatMessages = [...messages];
    } else if (message) {
      chatMessages = [{ role: 'user', content: message }];
    } else {
      return res.status(400).json({ ok: false, error: 'No message provided' });
    }

    const currentTime = new Date().toLocaleString();

    const systemMessage = {
      role: 'system',
      content: `You are the AI Support Agent for the AIM (Agent Identity Manager) platform.
Current System Time: ${currentTime}

INSTRUCTIONS:
1. Answer ANY question asked by the user naturally, concisely, and accurately (including math, general questions, time, and greetings).
2. For questions about AIM, use the product knowledge below.

AIM PRODUCT KNOWLEDGE:
- AIM manages AI Agent machine identities (API keys, scopes, rotation, 30-day stale reviews, auto-expiry).
- Agent Registration: /api/agents/register (creates identity record & token).
- Scope Enforcement: /api/simulator/execute (returns 403 Forbidden for unauthorized scopes).
- Credential Rotation: /api/credentials/rotate (revokes old token, issues new one).
- Stale Agent Detection: /api/reviews/stale-report (flags inactive agents >= 30 days).
- Dev Clock: /api/dev-clock/advance (simulates time travel for testing).`
    };

    const formattedMessages = [
      systemMessage,
      ...chatMessages.map((m) => ({
        role: m.role || (m.sender === 'user' ? 'user' : 'assistant'),
        content: m.content || m.text || '',
      })),
    ];

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: formattedMessages,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'I am here to help!';
    return res.json({ ok: true, reply });
  } catch (error) {
    console.error('Groq API Error:', error);
    return res.status(500).json({ ok: false, error: 'Failed to process chat request.' });
  }
});

export default router;
