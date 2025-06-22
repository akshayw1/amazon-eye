<div align="center">

# 👁️ Amazon Eye
## AI-Powered Trust & Safety Platform

### 🏆 Amazon Hackathon 2025 - Theme 2 Submission
**Team:** Akshay Waghmare, Jot Singh Bindra

---

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_Platform-FF9900?style=for-the-badge)](http://88.99.104.97:5173/)

---

## 🎯 **About Amazon Eye**

Amazon Eye is an **AI-powered e-commerce trust and safety platform** that revolutionizes online shopping security. Our platform combines advanced AI algorithms with real-time analysis to detect fraudulent activities, verify product authenticity, and ensure customer safety.

### **🌟 Key Features:**
- 🔍 **AI-Powered Trust Analysis** - Real-time product and seller verification
- 🛡️ **Fraud Detection** - Advanced algorithms to identify suspicious activities  
- 📊 **Network Analysis** - Cluster-based security assessment
- 🤖 **Automated Customer Service** - AI-driven call handling and support
- 👨‍💼 **Admin Dashboard** - Comprehensive platform management tools

---

## 🚀 **Live Demo**

**🌐 Experience Amazon Eye:** [http://88.99.104.97:5173/](http://88.99.104.97:5173/)

Try out our live platform to see AI-powered trust analysis in action!

---

## 🛠️ **Local Setup**

### **Prerequisites**
- Node.js 18+
- PostgreSQL 13+
- Git

### **Quick Start**

1. **Clone the repository:**
```bash
git clone https://github.com/your-repo/amazon-eye.git
cd amazon-eye
```

2. **Setup Backend:**
```bash
cd backend
npm install
cp .env.example .env  # Configure your database URL and API keys
npx prisma migrate dev
npx prisma generate
npm run dev
```

3. **Setup Frontend:**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the Application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### **Environment Variables**
```env
# Backend (.env)
DATABASE_URL="postgresql://username:password@localhost:5432/amazon_eye"
JWT_SECRET="your-secret-key"
GEMINI_API_KEY="your-gemini-api-key"

# Frontend (.env)
VITE_API_URL="http://localhost:3000/api"
```

---

## 📁 **Project Structure**

```
amazon-eye/
├── frontend/          # React.js application
├── backend/           # Node.js API server
├── calling-engine/    # Outbound calling service
├── extension/         # Browser extension
└── cluster_analysis_output/  # Trust analysis data
```

---

## 🔧 **Tech Stack**

- **Frontend:** React.js, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js, Prisma ORM
- **Database:** PostgreSQL
- **AI:** Google Gemini 2.0 Flash
- **Deployment:** Docker, Cloud hosting

---

## 👥 **Team**

| **Name** | **Role** |
|----------|----------|
| **Akshay Waghmare** | Full-Stack Developer & Backend Architect |
| **Jot Singh Bindra** | Frontend Developer & UI/UX Designer |

---

## 📄 **License**

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ for Amazon Hackathon 2025**

[![Visit Live Demo](https://img.shields.io/badge/🚀_Try_Now-Live_Platform-FF9900?style=for-the-badge&logo=amazon)](http://88.99.104.97:5173/)

</div>
