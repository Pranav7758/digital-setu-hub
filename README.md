# Virtual Setu - Digital Document Management Platform

A comprehensive digital document management system designed to streamline document organization, application processes, and emergency access for Indian citizens.

## 🚀 Features

### 📱 Core Functionality
- **Digital Document Storage** - Secure cloud-based document management
- **Smart Document Analysis** - AI-powered document categorization and verification
- **QR Code Emergency Access** - Instant document access via QR code scanning
- **PIN-Protected Sharing** - Secure document sharing without requiring recipient accounts

### 🤖 AI-Powered Assistant
- **Intelligent Chatbot** - Gemini AI integration for personalized document guidance
- **Smart Checklist System** - Dynamic document requirements based on application types
- **Real-time Document Analysis** - Automatic detection of uploaded documents
- **Personalized Recommendations** - Application suggestions based on current documents


### 🔒 Security Features
- **End-to-End Encryption** - Secure document storage and transmission
- **PIN Authentication** - Multi-layer security for document access
- **Emergency Access Protocol** - QR code-based emergency document retrieval
- **Privacy Protection** - No data sharing without explicit consent

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **AI Integration**: Google Gemini AI
- **Deployment**: Vercel
- **State Management**: React Query, React Hooks

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Google Gemini API key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pranav7758/digital-setu-hub.git
   cd digital-setu-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## 📱 Usage

### Document Management
1. **Upload Documents** - Drag and drop or select files for upload
2. **Organize by Type** - Automatic categorization (Aadhar, PAN, Education, etc.)
3. **Track Status** - Real-time verification and status updates

### Emergency Access
1. **Generate QR Code** - Create emergency access QR from your Digital ID
2. **Share Securely** - Anyone can scan and access with your PIN
3. **Download Documents** - Instant access to all your documents

### AI Assistant
1. **Ask Questions** - "What documents do I need for passport?"
2. **Get Smart Analysis** - AI analyzes your current documents
3. **Receive Guidance** - Step-by-step application processes

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the migration scripts in `/supabase/migrations/`
3. Configure storage buckets for document uploads
4. Set up Row Level Security (RLS) policies

### Gemini AI Integration
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to environment variables
3. Configure prompt templates for document analysis

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GEMINI_API_KEY=your_gemini_key
```

## 📊 Database Schema

### Key Tables
- `profiles` - User profile information
- `documents` - Document metadata and storage references
- `document_types` - Categorization system

### Supabase Functions
- `share-docs` - Handles QR code document sharing and PIN verification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Pranav**
- GitHub: [@Pranav7758](https://github.com/Pranav7758)
- Project: [Virtual Setu](https://virtual-setu-hub.vercel.app)

## 🙏 Acknowledgments

- Supabase for backend infrastructure
- Google Gemini for AI capabilities
- shadcn/ui for component library
- Vercel for deployment platform

---

**Virtual Setu** - Simplifying document management for the digital age.