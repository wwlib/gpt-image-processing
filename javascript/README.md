# JavaScript example - OpenAI Image Input

This folder contains a minimal Node.js script showing how to send text + image(s) to an OpenAI vision-capable model (e.g. `gpt-4o-mini`).

## Quick Start

1. Copy the environment template:
```bash
cp .env.example .env
```
2. Edit `.env` and set `OPENAI_API_KEY`.
3. Install dependencies:
```bash
npm install
```

4. Run with a remote image URL (default if no argument is given):
```bash
npm start
```

5. Run with a local image file:
```bash
npm start -- path/to/your-image.png
```

6. Dry run (print payload, no network call):
```bash
DRY_RUN=1 npm start -- path/to/your-image.png
```

## What `index.js` Does
- Loads env vars via `dotenv`
- Accepts a remote image URL or local file path as an argument
- Converts local files to a `data:` URL automatically
- Builds a `messages` array containing both text and one or more `image_url` parts
- Sends the request using the official `openai` Node SDK Chat Completions API
- Prints the textual response


## Multiple Images (Advanced)
By default, the script processes one image (URL or local file). To send multiple images, you can modify the `contentParts` array in `index.js`:
```js
contentParts.push({ type: 'image_url', image_url: { url: anotherUrlOrData } });
```
Order matters—models process them sequentially. Supported formats: png, jpg/jpeg (others default to `application/octet-stream`).

## Changing the Model
Set `MODEL` in `.env` (defaults to `gpt-4o-mini`). For higher quality try `gpt-4o` (higher cost + latency).

## Streaming (Optional Enhancement)
For streaming responses you can switch to the `/v1/responses` endpoint and use `stream: true` (not implemented here for clarity). If you want that added, ask and we can extend the example.

## Error Handling
The script prints structured API errors: `err.response?.data` if present, else the message.

## Security Notes
- Never commit your real `.env`
- Treat data URLs as sensitive if the image is confidential

## Next Ideas
- Add OCR style extraction prompts
- Save model output to JSON
- Support for multiple image arguments
- Custom prompt via CLI argument

Feel free to ask for any of those enhancements.


