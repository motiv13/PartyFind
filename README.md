# 🎮 PartyFind

PartyFind is a social platform for gamers to find teammates, friends and communities across different multiplayer games.

## ✨ Features

- 👤 Player Profiles
- 🔍 Search Players
- 🎮 Multi-game Support
- 👥 Friend requests and friends list
- 💬 Private messages between registered players
- 🎯 Party invitations with accept/decline

---

## Tech Stack

- Next.js 16
- React
- TypeScript
- TailwindCSS
- Better Auth
- SQLite (local development)

Planned infrastructure:

- Production-ready managed database
- Object storage for avatar uploads
- Real-time messaging

---

## Project Status

🟢 Active Development

Current Version:

v0.1.0

---

## Roadmap

See

ROADMAP.md

## Local setup

Requires Node.js 22 or newer.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set a private `BETTER_AUTH_SECRET` (at least 32 random characters). Keep this file out of Git.
3. Run `npx auth migrate --yes` to create the authentication tables.
4. Start PartyFind with `npm run dev` and open `http://127.0.0.1:3000`.

Local user accounts and profiles are stored in `data/partyfind.sqlite`. This SQLite setup is for local development; production hosting needs persistent database storage and a production secret.

---

## Documentation

Located in

/docs
