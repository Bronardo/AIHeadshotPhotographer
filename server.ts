import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// High body size limit for base64 image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI Headshot Generation Endpoint
app.post('/api/generate-headshot', async (req, res) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      styleTitle = 'Corporate Grey Backdrop',
      backdrop = 'Neutral studio grey backdrop with soft gradient',
      attire = 'Tailored dark navy blazer with crisp white shirt',
      lighting = 'Three-point studio softbox lighting with soft catchlights',
      expression = 'Confident, warm professional smile',
      aspectRatio = '1:1',
      customNotes = '',
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please add your key in AI Studio Secrets.',
      });
    }

    // Strip header prefix if present (e.g., "data:image/jpeg;base64,")
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
    const cleanMimeType = (mimeType || 'image/jpeg').replace(/^data:/, '').split(';')[0];

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Construct high-precision professional photographer prompt
    const promptText = `Professional commercial studio photographer generating a generic executive headshot of the person in the input photo.

Subject & Likeness:
- Accurately preserve the authentic face shape, facial features, ethnicity, eyes, nose, lips, age, and recognizable likeness of the person in the reference image.
- Natural, healthy skin texture with visible micro-pores and realistic subsurface light scattering. Avoid artificial plastic airbrushing or porcelain blurring.

Style & Environment:
- Style: ${styleTitle}
- Background: ${backdrop}

Wardrobe & Styling:
- Attire: ${attire}
- Hair: Tasteful, clean, well-groomed professional appearance.

Lighting & Camera Optics:
- Lighting: ${lighting}
- Camera: Shot on 85mm f/1.4 portrait prime lens stopped down to f/2.8 for razor-sharp eyes and pleasing optical depth-of-field falloff.
- Framing: Eye-level, centered bust / head-and-shoulders composition.
- Expression: ${expression}
${customNotes ? `- Photographer Notes: ${customNotes}` : ''}

Output requirement: Single, perfectly exposed, color-graded professional headshot photograph. No watermarks, no distorted anatomy, no text overlays.`;

    const candidateModels = [
      'gemini-3.1-flash-image-preview',
      'gemini-3.1-flash-image',
      'gemini-3.1-flash-lite-image',
      'gemini-2.5-flash-image',
    ];

    let generatedImageUrl: string | null = null;
    let usedModel = '';
    let lastError: Error | null = null;

    for (const modelName of candidateModels) {
      try {
        console.log(`[Headshot API] Attempting generation with model: ${modelName}`);

        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType: cleanMimeType,
                },
              },
              {
                text: promptText,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio === '3:4' ? '3:4' : '1:1',
            },
          },
        });

        const parts = response.candidates?.[0]?.content?.parts;
        if (parts && parts.length > 0) {
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              const outMime = part.inlineData.mimeType || 'image/png';
              generatedImageUrl = `data:${outMime};base64,${part.inlineData.data}`;
              usedModel = modelName;
              break;
            }
          }
        }

        if (generatedImageUrl) {
          break; // successfully generated
        } else {
          console.warn(`[Headshot API] Model ${modelName} returned no image part in response.`);
        }
      } catch (err: any) {
        console.warn(`[Headshot API] Model ${modelName} failed:`, err?.message || err);
        lastError = err;
      }
    }

    if (!generatedImageUrl) {
      const errorMsg = lastError?.message || 'The AI model could not generate an image part. Please try another selfie or adjust settings.';
      return res.status(502).json({
        error: errorMsg,
        details: 'Image generation failed across available models.',
      });
    }

    return res.json({
      success: true,
      image: generatedImageUrl,
      modelUsed: usedModel,
      promptUsed: promptText,
      aspectRatio,
    });
  } catch (error: any) {
    console.error('[Headshot API Error]:', error);
    return res.status(500).json({
      error: error?.message || 'An unexpected error occurred during headshot generation.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Headshot Photographer server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
