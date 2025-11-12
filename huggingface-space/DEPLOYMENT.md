# Hugging Face Space Deployment Guide

## Prerequisites

1. **Hugging Face Account**: Create account at https://huggingface.co/join
2. **Git**: Installed on your system
3. **Git LFS**: For large files (optional for this project)

## Step 1: Create a New Space

1. Go to https://huggingface.co/spaces
2. Click "Create new Space"
3. Fill in details:
   - **Name**: `career-plus-rewriter` (or your preferred name)
   - **License**: MIT
   - **SDK**: Gradio
   - **Hardware**: GPU (T4 small - free tier)
   - **Visibility**: Public

## Step 2: Clone the Space Repository

```bash
# Clone your new space
git clone https://huggingface.co/spaces/YOUR_USERNAME/career-plus-rewriter
cd career-plus-rewriter
```

## Step 3: Copy Files

Copy the files from this directory to your cloned space:

```bash
# From the huggingface-space directory
cp app.py ../path/to/career-plus-rewriter/
cp requirements.txt ../path/to/career-plus-rewriter/
cp README.md ../path/to/career-plus-rewriter/
```

## Step 4: Commit and Push

```bash
cd career-plus-rewriter

# Add files
git add .

# Commit
git commit -m "Initial commit: Career+ Resume Rewriter"

# Push to Hugging Face
git push
```

## Step 5: Wait for Build

1. Go to your Space URL: `https://huggingface.co/spaces/YOUR_USERNAME/career-plus-rewriter`
2. Wait for the build to complete (5-10 minutes)
3. The Space will automatically start once built

## Step 6: Test the Space

1. Open your Space URL
2. Test with sample bullet points
3. Verify the rewriting works correctly

## Step 7: Get API Endpoint

Your Space API endpoint will be:
```
https://YOUR_USERNAME-career-plus-rewriter.hf.space
```

Update your frontend `.env` file:
```
VITE_HF_SPACE_URL=https://YOUR_USERNAME-career-plus-rewriter.hf.space
```

## Hardware Options

### Free Tier (Recommended for MVP)
- **CPU Basic**: Free, slower (30-60s per bullet)
- **GPU T4 Small**: Free, faster (5-10s per bullet)

### Paid Tiers (For Production)
- **GPU T4 Medium**: $0.60/hour
- **GPU A10G Small**: $1.05/hour
- **GPU A10G Large**: $3.15/hour

## Troubleshooting

### Build Fails

**Issue**: Out of memory during model loading

**Solution**: 
1. Ensure you're using GPU hardware
2. Check that 4-bit quantization is enabled
3. Try a smaller model (e.g., Mistral-7B instead of Llama-13B)

### Slow Performance

**Issue**: Takes too long to generate

**Solution**:
1. Upgrade to GPU hardware
2. Reduce `max_new_tokens` in app.py
3. Increase `temperature` for faster sampling

### Model Not Loading

**Issue**: Model download fails

**Solution**:
1. Check internet connection in Space
2. Verify model name is correct
3. Try a different model from Hugging Face Hub

## Monitoring

Monitor your Space:
1. Go to Space settings
2. Check "Analytics" tab for usage
3. View logs in "Logs" tab

## Updating the Space

To update your Space:

```bash
# Make changes to app.py or requirements.txt
git add .
git commit -m "Update: description of changes"
git push
```

The Space will automatically rebuild.

## Cost Management

**Free Tier Limits**:
- CPU: Unlimited (with sleep after inactivity)
- GPU: Limited hours per month
- Concurrent users: 2-3

**Tips to Stay Free**:
1. Use CPU for development
2. Switch to GPU only for production
3. Enable sleep mode (auto-enabled)
4. Monitor usage in settings

## Security

**Best Practices**:
1. Don't store user data
2. Don't log sensitive information
3. Rate limit if needed (add to app.py)
4. Keep dependencies updated

## Integration with Frontend

Once deployed, update your frontend API client:

```typescript
// frontend/src/lib/ai/api-client.ts
const HF_SPACE_URL = import.meta.env.VITE_HF_SPACE_URL

export async function rewriteBullet(
  bullet: string,
  jobDescription: string,
  tone: string = 'professional'
): Promise<string> {
  const response = await fetch(`${HF_SPACE_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [bullet, jobDescription, tone, 0.7]
    })
  })
  
  const result = await response.json()
  return result.data[0]
}
```

## Support

For issues:
1. Check Hugging Face Space logs
2. Review Gradio documentation: https://gradio.app/docs
3. Ask in Hugging Face forums: https://discuss.huggingface.co/

## Next Steps

After deployment:
1. Test thoroughly with various inputs
2. Monitor performance and costs
3. Gather user feedback
4. Iterate on prompts for better results
5. Consider upgrading hardware if needed
