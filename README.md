# ✦ RAHUL-AI-MINI

A lightweight WhatsApp assistant built with Node.js and Baileys, featuring a responsive neon-glass pairing portal, media helpers, smart utilities, and group commands.

## ✨ What's new in v1.1.2

- Refreshed dark neon/glass pairing portal with responsive layout
- Phone-number validation, useful error messages, and tap-to-copy pairing code
- Removed the preset phone-number fallback from the pairing endpoint
- Redesigned WhatsApp menu for quicker command discovery
- Replaced JavaScript `eval` in the calculator with a small arithmetic parser
- Added a `/health` route for hosting health checks
- Added the missing `form-data` package dependency
- Updated setup and Docker instructions

- Added Sayan Nexus music API to `.play <song>` and `.song <song>` with track details, thumbnail, and MP3 audio delivery\n\n## Requirements

- Node.js 20 or newer
- npm
- A WhatsApp account you are authorized to link

## Run locally / Termux

```bash
pkg update -y
pkg install nodejs git -y
git clone https://github.com/Rdx690/RAHUL-AI-MINI.git
cd RAHUL-AI-MINI
npm install
npm start
```

Open `http://localhost:8080` to access the pairing portal. On a hosted service, open its public URL.

## Pairing

1. Open the pairing portal.
2. Enter the WhatsApp number including the country calling code (digits only).
3. Generate the pairing code.
4. In WhatsApp, open **Linked devices → Link with phone number** and enter the code.

Never share pairing codes or the `session/` folder. The saved session grants access to the linked WhatsApp account.

## Configuration

- `PORT` (optional): web server port; defaults to `8080`.
- Default command prefix: `.` (change at runtime with `.setprefix`).
- Runtime credentials are saved under `session/`; keep them private and do not commit them.

## Docker

```bash
docker build -t rahul-ai-mini .
docker run --restart unless-stopped -p 8080:8080 -v "$PWD/session:/app/session" rahul-ai-mini
```

Use your hosting platform's required `PORT` variable where applicable. Keep the session volume persistent across restarts.

## Notes

- Some downloader APIs are third-party services and may change or become unavailable.
- Download or share media only when you have permission.
- Protect your pairing endpoint and hosting URL; do not expose pairing codes publicly.
- WhatsApp/Baileys behavior may change over time. This project is not affiliated with WhatsApp or Meta.

## License

Apache-2.0. See [LICENSE](LICENSE).
