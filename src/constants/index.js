export const navLinks = [
  { id: "about", title: "About" },
  { id: "experience", title: "Experience" },
  { id: "skills", title: "Skills" },
  { id: "projects", title: "Projects" },
  { id: "contact", title: "Contact" },
];

export const personalInfo = {
  name: "Saimani Ippili",
  title: "Data Science & Big Data Analytics | ML & GenAI",
  email: "ippilisaimani40@gmail.com",
  phone: "+91 8341847261",
  location: "Bobbili, AP",
  linkedin: "https://www.linkedin.com/in/saimani-ippili-356830247/", 
  github: "https://github.com/saimaniippili", 
  kaggle: "https://www.kaggle.com/saimaniippili", 
  objective: "B.Tech CSE fresher (2026) specializing in Data Science & Big Data Analytics, with hands-on experience building end-to-end ML pipelines and GenAI applications using LangChain, RAG, and local LLMs via Ollama. Delivered real-world projects including a conversational data analysis tool and an AI-powered healthcare chatbot. AWS certified with strong Python, NLP, and full-stack skills. Eager to contribute to a data-driven team tackling impactful problems."
};

export const education = [
  {
    institution: "KL University",
    degree: "B.Tech CSE | Data Science & Big Data Analytics",
    date: "2022 – 2026",
    location: "Vijayawada, AP",
  },
  {
    institution: "Narayana Junior College",
    degree: "Intermediate (MPC)",
    date: "2020 – 2022",
    location: "Andhra Pradesh",
  }
];

export const skills = [
  {
    category: "ML & AI",
    items: ["Python", "Scikit-learn", "TF-IDF", "Logistic Regression", "Random Forest", "SVM", "SMOTE", "Feature Engineering"]
  },
  {
    category: "Data",
    items: ["Pandas", "NumPy", "SQL", "Matplotlib", "Seaborn", "Tableau", "Excel", "EDA"]
  },
  {
    category: "LLM & AI Apps",
    items: ["LangChain", "Ollama (Llama3, Mistral, Gemma, Phi3)", "RAG Pipelines", "Local LLM Deployment", "Vector Search"]
  },
  {
    category: "Cloud",
    items: ["AWS (Cloud Practitioner)", "Linux", "Git", "Jupyter Notebook"]
  },
  {
    category: "Web & DB",
    items: ["React", "Node.js", "Flask", "Django", "Spring Boot", "MySQL", "MongoDB", "REST APIs"]
  }
];

export const projects = [
  {
    title: "DataChat: Conversational Data Analysis Tool",
    tags: ["LangChain", "Ollama", "Python", "React", "REST API", "Pandas"],
    description: "Built a full-stack web application enabling natural language querying of CSV/Excel datasets using LangChain agents integrated with local LLMs (Llama3, Mistral, Gemma) via Ollama. Implemented conversational chat interface with dynamic chart generation; supports multi-model selection and real-time data analysis. Designed modular LangChain tool architecture connecting LLM inference to Pandas operations.",
  },
  {
    title: "MedSage: AI Healthcare Chatbot with RAG",
    tags: ["RAG", "LangChain", "Flask", "React", "Ollama", "Node.js"],
    description: "Built a full-stack clinical triage application using a RAG pipeline over local medical knowledge bases, delivering structured reports with severity assessment, possible conditions, red flags, and care recommendations. Integrated Ollama-powered local LLMs with a Flask REST backend and React frontend. Designed for complete on-device inference with no data leaving the user's machine.",
  },
  {
    title: "Fake Job Detection Pipeline",
    tags: ["NLP", "Random Forest", "Python", "TF-IDF", "SMOTE", "Scikit-learn"],
    description: "Built NLP pipeline on 17K records using TF-IDF + Random Forest to detect fraudulent job postings, achieving 90% accuracy. Handled class imbalance with SMOTE; evaluated with precision, recall & F1-score; visualized fraud patterns using Seaborn for recruiter insights.",
  }
];

export const certifications = [
  "AWS Certified Cloud Practitioner (2024)",
  "Salesforce Certified AI Specialist (2024)",
  "Salesforce Certified AI Associate (2024)",
  "Red Hat Certified Enterprise App Developer (2024)"
];

export const achievements = [
  {
    title: "Project Lead",
    description: "Led 3-member team to design, develop & deploy an Online Job Portal (React, Node.js, Django, MySQL) using Agile methodology."
  },
  {
    title: "Workshop Conductor",
    description: "Delivered Full-Stack Development session to 30+ junior students covering React, Node.js, and REST APIs."
  },
  {
    title: "Hackathon Participant",
    description: "Delivered a working prototype within 48 hours at university hackathon (2024); shortlisted among top teams."
  }
];
