const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Study Buddy API (Express) is running!' 
  });
});

app.post('/generate', (req, res) => {
  const { topic } = req.body || {};
  if (!topic) {
    return res.status(400).json({ 
      error: 'Missing topic in request body' 
    });
  }
  // Here the actual AI logic would go, but for now we return dummy data
  const summary = `A concise explanation of ${topic}.`;
  const flashcards = [
    { 
      q: `What is ${topic}?`, 
      a: `A short definition of ${topic}.` 
    },
    { q: `Why is ${topic} important?`, 
      a: `Because it helps with doing nothing and wasting time.` 
    },
    {
      q: `How does ${topic} work?`,
      a: `It works by sleeping and dreaming about ${topic}.`
    }
  ];
  const quiz = [
    { question: `Which statement about ${topic} is true?`, 
      choices: ['Option A', 'Option B', 'Option C'], 
      answerIndex: 0 
  }
  ];

  res.json({ summary, flashcards, quiz });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Express server listening on port ${PORT}`));
