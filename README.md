<div align="center">
  <div style="display:inline-block; border-radius:16px; padding: 12px; background-color: #000; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    <img src="https://img.icons8.com/color/96/000000/artificial-intelligence.png" alt="VentureIQ Logo" width="80" height="80">
  </div>

  <h1 style="margin-top: 20px;">VentureIQ</h1>
  <h3>Enterprise-Grade AI Due Diligence Platform</h3>

  <p align="center">
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://clerk.com/"><img src="https://img.shields.io/badge/Clerk_Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk Auth" /></a>
    <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" /></a>
    <a href="https://groq.com/"><img src="https://img.shields.io/badge/Groq_AI-F55036?style=for-the-badge&logo=groq&logoColor=white" alt="Groq AI" /></a>
  </p>

  <p>
    <em>Transform the way you evaluate startups, businesses, and pitch decks with automated, AI-driven intelligence.</em>
  </p>
</div>

---

## 📖 Overview

**VentureIQ** is an advanced AI-powered platform designed to streamline business evaluation and due diligence. By leveraging cutting-edge Large Language Models (LLMs), dynamic web scraping, and advanced document parsing, VentureIQ reduces weeks of manual research into seconds. 

Whether you are a Venture Capitalist evaluating a pitch deck, a founder analyzing market competitors, or a consultant assessing business risks, VentureIQ delivers complete clarity through comprehensive, data-backed reports and interactive AI analysis.

---

## ⚡ The Challenge

Business evaluation is traditionally a highly manual, time-consuming, and expensive process. Professionals typically spend hours gathering data to understand:
- 🔍 **Competitive Landscapes**
- 📈 **Market Demand & Trends**
- ⚠️ **Operational & Financial Risks**
- ⚖️ **Company Strengths & Weaknesses**

This friction makes it difficult for agile teams, early-stage investors, and independent founders to perform rapid, accurate due diligence at scale.

---

## 🚀 The Solution

VentureIQ automates the entire due diligence lifecycle. Simply input a business description, a website URL, or upload internal documents (like a PDF pitch deck), and our AI engine instantly generates an enterprise-grade report.

### ✨ Core Capabilities

- 🤖 **Interactive AI Copilot**: Go beyond static reports. Each generated report includes a dedicated AI Copilot interface where you can ask complex follow-up questions, request score explanations, and brainstorm investment hypotheses directly against the analyzed data.
- 📄 **Document Intelligence**: Upload pitch decks, business plans, or financial reports (PDF, DOCX, PPTX). Our engine extracts the text, analyzes the content, and seamlessly merges these insights into the final report.
- 🌐 **Website Intelligence**: Provide a target URL, and VentureIQ will autonomously scrape and parse the live website to extract accurate, real-time marketing and technical data.
- 🧠 **Explainable AI (XAI) & Source Attribution**: Complete transparency. Know exactly whether an insight was scraped from the web, parsed from an uploaded document, or inferred by the AI.
- 📊 **Premium Analytics Dashboard**: Visualize your entire library of due diligence reports with smooth, interactive charts and an intuitive, beautiful interface built on ShadCN UI and Recharts.
- 📑 **Instant PDF Exports**: Generate polished, printable tear-sheets directly from the web application with a single click.

---

## 🎯 Target Audience

| User Persona | Primary Use Case |
| :--- | :--- |
| **Venture Capitalists & Angel Investors** | Perform rapid, preliminary due diligence on startup investment opportunities and pitch decks. |
| **Startup Founders** | Validate new ideas, analyze the market landscape, and polish pitches before launch. |
| **Business Consultants** | Generate comprehensive initial business assessments to accelerate client strategy sessions. |
| **Private Equity & M&A Teams** | Quickly identify red flags, growth opportunities, and financial mentions in target companies. |

---

## 💻 Technical Architecture

VentureIQ is engineered for scale, speed, and beautiful user experiences using modern, production-grade tools:

- **Frontend & Framework**: [Next.js 15 App Router](https://nextjs.org/) (React) with [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/) for a sleek, accessible design system
- **Authentication**: [Clerk](https://clerk.com/) for secure, robust identity management
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) with Mongoose for flexible, scalable report storage
- **AI Engine**: [Groq SDK](https://groq.com/) powering instantaneous inference (using `llama-3.3-70b-versatile` & `llama-3-70b-8192`)
- **Interactive Analytics**: [Recharts](https://recharts.org/) for beautiful data visualization
- **Document Processing**: Custom extraction pipeline utilizing `pdf-parse` and `mammoth`

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm, yarn, or pnpm
- MongoDB Atlas Account
- Groq API Key
- Clerk Account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/venture-iq.git
   cd venture-iq
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add your credentials:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

   # Database
   MONGODB_URI=your_mongodb_connection_string

   # AI Generation
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Launch the Development Server**
   ```bash
   npm run dev
   ```

5. **Explore**
   Open [http://localhost:3000](http://localhost:3000) in your browser to start generating intelligent reports.

---
<div align="center">
  <i>Built with focus and precision for modern business intelligence.</i>
</div>
