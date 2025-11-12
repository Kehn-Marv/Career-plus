---
title: Career+ Resume Rewriter
emoji: 🚀
colorFrom: blue
colorTo: purple
sdk: gradio
sdk_version: 4.8.0
app_file: app.py
pinned: false
license: mit
---

# Career+ Resume Rewriter

AI-powered resume bullet point rewriting using Mistral-7B-Instruct.

## Features

- **AI-Powered Rewriting**: Uses Mistral-7B-Instruct for high-quality text generation
- **Job-Tailored**: Rewrites bullets to match specific job descriptions
- **Batch Processing**: Rewrite multiple bullets at once
- **Tone Control**: Professional, dynamic, technical, or leadership tones
- **Quantization**: 4-bit quantization for efficient GPU usage
- **Free to Use**: No API keys required

## How It Works

1. **Input**: Paste your resume bullet points (one per line)
2. **Context**: Provide the job description you're targeting
3. **Customize**: Select tone and creativity level
4. **Generate**: AI rewrites each bullet to be more impactful

## Model

- **Base Model**: mistralai/Mistral-7B-Instruct-v0.2
- **Quantization**: 4-bit (NF4) for efficiency
- **Max Tokens**: 256 per bullet
- **Temperature**: 0.3-1.0 (adjustable)

## API Usage

You can call this Space programmatically:

```python
from gradio_client import Client

client = Client("your-username/career-plus-rewriter")

result = client.predict(
    bullets_text="Managed team projects\nImproved system performance",
    job_description="Senior Software Engineer role...",
    tone="professional",
    temperature=0.7,
    api_name="/predict"
)

print(result)
```

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally
python app.py
```

## Integration with Career+

This Space is part of the Career+ platform. Visit the main app at:
https://career-plus.vercel.app

## License

MIT License - See LICENSE file for details

## Credits

Built with:
- [Mistral AI](https://mistral.ai/) - LLM
- [Hugging Face](https://huggingface.co/) - Model hosting
- [Gradio](https://gradio.app/) - UI framework
