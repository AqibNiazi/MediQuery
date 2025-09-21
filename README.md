# MediQuery - AI-Powered Symptom Checker & Report Generator

A hackathon-ready MVP that helps patients input symptoms and get clear, patient-friendly explanations with downloadable doctor reports.

## 🚀 Features

- **Chat-style symptom input** - Natural language interface for describing symptoms
- **AI-powered analysis** - Patient-friendly explanations with safety disclaimers
- **Structured guidance** - Possible causes, home remedies, and warning signs
- **PDF report generation** - Download SOAP-format reports for healthcare providers
- **Safety-first design** - Comprehensive medical disclaimers and non-diagnostic approach
- **Responsive UI** - Works on all devices with modern, medical-grade design

## 🛠️ Tech Stack

- **Frontend**: Next.js 13, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes
- **AI Integration**: Groq API with Llama models
- **PDF Generation**: jsPDF
- **Styling**: Tailwind CSS with custom medical color system

## 🏃‍♂️ Quick Start

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   # Copy .env and add your OpenAI API key
   GROQ_API_KEY=your_groq_api_key_here
   ```
   
   *Note: The app works with mock data if no API key is provided - perfect for demos!*

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## Setup Instructions

## 🎯 Demo Flow

1. **Enter symptoms** in natural language (e.g., "I have a sore throat and mild fever for two days")
2. **Get AI analysis** with patient-friendly explanations and safety guidance
3. **Download PDF report** in SOAP format for sharing with healthcare providers
4. **View disclaimers** and safety warnings throughout the experience

## 🏥 Key Components

### Symptom Analysis
- Natural language processing of patient symptoms
- Educational explanations in simple language
- Possible causes with appropriate disclaimers
- Home care suggestions and warning signs

### PDF Report Generation
- Professional SOAP notes format (Subjective, Objective, Assessment, Plan)
- Comprehensive disclaimers and safety information
- Doctor-ready structure for clinical use
- Downloadable PDF with patient symptom summary

### Safety Features
- Prominent medical disclaimers throughout
- Clear "urgent warning signs" sections
- Non-diagnostic language and approach
- Educational purpose emphasis

## 🎨 Design System

- **Primary Blue**: #2563eb (trust, medical professionalism)
- **Secondary Teal**: #0d9488 (calm, healing)
- **Success Green**: #16a34a (positive outcomes)
- **Warning Red**: #dc2626 (urgent attention needed)
- **Clean gradients** and **subtle shadows** for modern aesthetic
- **Mobile-first responsive design**

## 📋 Environment Variables

```bash
GROQ_API_KEY=your_groq_api_key_here
```

## 🚀 Deployment

This app is configured for static export and can be deployed to any static hosting service:

```bash
npm run build
```

## ⚠️ Important Medical Disclaimers

- This application is for **educational purposes only**
- Does **not provide medical diagnoses**
- **Always consult healthcare professionals** for medical concerns
- Not a substitute for professional medical advice
- Includes prominent disclaimers throughout the user experience

## 🎯 Hackathon Ready

- **Quick setup** with mock data fallback
- **Demo-friendly** UI with smooth animations
- **Production-quality** code and design
- **Comprehensive feature set** in minimal codebase
- **Clear value proposition** for judges and users

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface
- Accessible design patterns

## 🔮 Future Enhancements

- Voice input using Web Speech API
- Session history with local storage
- Multi-language support
- Integration with health tracking apps
- Telemedicine appointment booking

---

**Built for healthcare innovation hackathons** 🏥✨