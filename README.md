# PhishX — GenAI Phishing Simulation & Defense Platform

PhishX simulates phishing attacks and trains users to spot them. It uses a local LLM (Ollama) to generate explainable feedback on *why* an email is phishing, adapts difficulty to each user, and gives security teams a SOC-style analytics dashboard.

## Features
- 🎣 **Phishing email generation** for realistic training simulations
- 🤖 **Explainable AI feedback**: Ollama-powered explanations of the red flags in each email
- 📈 **Adaptive difficulty** that adjusts simulations based on user performance
- 📊 **SOC analytics dashboard** that visualizes simulation results and user performance
- 🐳 **Fully containerized** with Docker Compose

## Architecture
| Folder | Description |
|---|---|
| `Engine/gateway` | API gateway routing requests between services |
| `Engine/phishing-generator` | Generates simulated phishing emails |
| `Engine/simulation-portal` | Runs simulations and collects user responses |
| `Frontend` | React + Vite + Tailwind SOC analytics dashboard |

## Tech Stack
FastAPI · React · Vite · Tailwind CSS · Ollama · Docker

## Screenshots
<!-- Upload screenshots to docs/screenshots/ then delete this comment line and the one below
![Dashboard](docs/screenshots/dashboard.png)
![AI Feedback](docs/screenshots/feedback.png)
-->

## Getting Started
**Requirements:** Docker, Docker Compose, and [Ollama](https://ollama.com) running locally.

```bash
git clone https://github.com/ahmed27dev/PhishX.git
cd PhishX/Engine
docker-compose up --build
```

To run the frontend separately:
```bash
cd PhishX/Frontend
npm install
npm run dev
```

## My Contribution
Team project. I built:
- The Ollama-based explainable AI feedback feature
- The FastAPI backend for the AI explainability and feedback workflow
- The SOC analytics visualizations in the React frontend
