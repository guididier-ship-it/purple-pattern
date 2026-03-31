import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const headers = {
      'Authorization': `Key ${process.env.FAL_KEY}`,
      'Content-Type': 'application/json',
    };

    // Submit request to fal.ai queue
    const submitRes = await fetch('https://queue.fal.run/fal-ai/nano-banana-2', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        num_images: 1,
        aspect_ratio: '16:9',
        resolution: '1K',
        output_format: 'png',
      }),
    });

    if (!submitRes.ok) {
      const err = await submitRes.text();
      console.error('Fal.ai submit error:', submitRes.status, err);
      return res.status(submitRes.status).json({ error: `Fal.ai error: ${err}` });
    }

    const submitData = await submitRes.json();
    const responseUrl = submitData.response_url;

    if (!responseUrl) {
      return res.json(submitData);
    }

    // Poll for result
    const maxAttempts = 150;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 3000));

      const statusRes = await fetch(submitData.status_url, { headers });
      const statusData = await statusRes.json();

      if (statusData.queue_position !== undefined) {
        console.log(`Queue position: ${statusData.queue_position}`);
      }

      if (statusData.status === 'COMPLETED') {
        const resultRes = await fetch(responseUrl, { headers });
        const resultData = await resultRes.json();
        return res.json(resultData);
      }

      if (statusData.status === 'FAILED') {
        return res.status(500).json({ error: 'Image generation failed' });
      }
    }

    res.status(504).json({ error: 'Generation timed out — queue too long' });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(PORT, () => {
  console.log(`Purple Pattern running at http://localhost:${PORT}`);
});
