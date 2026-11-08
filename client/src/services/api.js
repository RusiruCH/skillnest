import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach valid JWT token from localStorage to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillnest_token');
    // Ensure we do not send dummy or placeholder strings to real endpoints
    if (token && !token.startsWith('demo_')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor: purge expired/invalid tokens upon 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Remove stale/invalid token so future requests do not repeatedly fail
      localStorage.removeItem('skillnest_token');
    }
    return Promise.reject(error);
  }
);

// Fallback Mock Dataset for offline / preview convenience
export const MOCK_COURSES = [
  {
    _id: 'c101',
    title: 'Full-Stack Modern MERN Web Development',
    subtitle: 'Build production-ready web applications using MongoDB, Express, React, and Node.js.',
    description:
      'A comprehensive practical guide to mastering the MERN stack. Learn to architect REST APIs, manage MongoDB collections with Mongoose, build responsive single-page applications with React, and deploy full-stack solutions.',
    category: 'Web Development',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    instructor: {
      _id: 'u01',
      name: 'L.M.R.C. Bandara',
      email: 'instructor@skillnest.edu',
      bio: 'Senior Lecturer in Software Engineering & Internet Application Development at SEUSL.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
    status: 'approved',
    rating: 4.9,
    enrolledCount: 142,
    prerequisites: ['Basic JavaScript (ES6+)', 'HTML & CSS Fundamentals', 'Basic understanding of HTTP'],
    learningOutcomes: [
      'Design and deploy Express.js REST APIs with robust error handling',
      'Model complex data schemas and relationships in MongoDB using Mongoose',
      'Build modular, high-performance UI components with React 18',
      'Implement JSON Web Token (JWT) authentication and role-based access control',
    ],
    structures: [
      {
        _id: 't201',
        title: 'Module 1: Backend Architecture with Node.js and Express',
        description: 'Understanding event-driven I/O, middleware pipelines, and routing in Express.js.',
        order: 1,
        durationMinutes: 60,
        materials: [
          {
            _id: 'm301',
            title: 'Express REST Server Setup & Middleware Pipeline',
            materialType: 'video',
            resourceLocation: 'https://www.youtube.com/watch?v=7H_QH9nipNs',
            externalUrl: 'https://www.youtube.com/watch?v=7H_QH9nipNs',
            content: 'In this video lecture, we cover setting up Express with CORS, dotenv, and JSON parsing middlewares.',
            durationMinutes: 24,
            order: 1,
          },
          {
            _id: 'm302',
            title: 'REST API Best Practices and Status Codes Reference',
            materialType: 'notes',
            content: `### REST API Architecture Rules\n1. **Stateless Communication**: Every HTTP request must carry all credentials and parameters.\n2. **Standard Status Codes**:\n   - 200 OK - Request succeeded\n   - 201 Created - Resource persisted\n   - 400 Bad Request - Missing parameters\n   - 401 Unauthorized - Invalid token\n   - 403 Forbidden - Insufficient permissions\n   - 404 Not Found - Non-existent resource\n3. **Plural Nouns**: Prefer /api/courses over /api/getCourse.`,
            durationMinutes: 15,
            order: 2,
          },
          {
            _id: 'm303',
            title: 'Sample Express Router Boilerplate',
            materialType: 'code',
            codeLanguage: 'javascript',
            content: `const express = require('express');\nconst router = express.Router();\n\nrouter.get('/', (req, res) => {\n  res.status(200).json({\n    success: true,\n    message: 'Welcome to SkillNest Course API'\n  });\n});\n\nmodule.exports = router;`,
            durationMinutes: 10,
            order: 3,
          },
        ],
      },
      {
        _id: 't202',
        title: 'Module 2: Database Modeling with MongoDB & Mongoose',
        description: 'Designing collections, schemas, indexes, and document relations.',
        order: 2,
        durationMinutes: 75,
        materials: [
          {
            _id: 'm304',
            title: 'Mongoose Schema Definition & Validation Guide',
            materialType: 'notes',
            content: `### Mongoose Validation Strategies\n- required: Ensures mandatory fields exist.\n- enum: Restricts values to allowed list.\n- match: Validates against regex (e.g. emails).\n- Pre-save hooks: Useful for encrypting passwords.`,
            durationMinutes: 20,
            order: 1,
          },
        ],
      },
      {
        _id: 't203',
        title: 'Module 3: Frontend Client Integration with React',
        description: 'State management, custom hooks, and consuming REST endpoints with Axios.',
        order: 3,
        durationMinutes: 90,
        materials: [],
      },
    ],
  },
  {
    _id: 'c102',
    title: 'Object-Oriented Programming with Java & Design Patterns',
    subtitle: 'Master OOP principles, SOLID patterns, and software design architecture in Java.',
    description:
      'Deep dive into Encapsulation, Inheritance, Polymorphism, Abstraction, and essential Gang of Four (GoF) design patterns including Singleton, Factory, and Observer.',
    category: 'Software Engineering',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    instructor: {
      _id: 'u01',
      name: 'L.M.R.C. Bandara',
      email: 'instructor@skillnest.edu',
      bio: 'Senior Lecturer in Software Engineering & Internet Application Development at SEUSL.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
    status: 'approved',
    rating: 4.8,
    enrolledCount: 98,
    prerequisites: ['Basic computer science literacy'],
    learningOutcomes: [
      'Apply the 4 fundamental pillars of OOP in Java',
      'Refactor monolithic codebases using SOLID principles',
    ],
    structures: [
      {
        _id: 't204',
        title: 'Unit 1: The Four Pillars of Object Orientation',
        description: 'Encapsulation, Data Hiding, Method Overriding vs Overloading.',
        order: 1,
        durationMinutes: 50,
        materials: [
          {
            _id: 'm305',
            title: 'Polymorphism and Interface Implementation in Java',
            materialType: 'code',
            codeLanguage: 'java',
            content: `public interface Printable {\n    void printDetails();\n}\n\npublic class Course implements Printable {\n    private String title;\n    public Course(String title) { this.title = title; }\n    @Override\n    public void printDetails() {\n        System.out.println("Course: " + title);\n    }\n}`,
            durationMinutes: 15,
            order: 1,
          },
        ],
      },
    ],
  },
  {
    _id: 'c103',
    title: 'Data Structures & Algorithms in Python',
    subtitle: 'From Big-O analysis to Trees, Graphs, and Dynamic Programming.',
    description:
      'A comprehensive course designed to build algorithmic thinking. Covers Arrays, Linked Lists, Stacks, Queues, Binary Search Trees, and Graph Traversal algorithms.',
    category: 'Algorithms',
    level: 'Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    instructor: {
      _id: 'u01',
      name: 'L.M.R.C. Bandara',
      email: 'instructor@skillnest.edu',
      bio: 'Senior Lecturer in Software Engineering & Internet Application Development at SEUSL.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
    status: 'pending_approval',
    rating: 5.0,
    enrolledCount: 0,
    prerequisites: ['Basic Python programming syntax'],
    learningOutcomes: ['Analyze asymptotic time and space complexities using Big-O notation'],
    structures: [],
  },
  {
    _id: 'c104',
    title: 'Relational Database Design & SQL Optimization',
    subtitle: 'Normalization, Indexing, and Query Performance in PostgreSQL & MySQL.',
    description:
      'Hands-on relational database design course for modern internet applications. Learn ER diagramming, 1NF to BCNF normalization, and B-Tree indexing.',
    category: 'Database',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
    instructor: {
      _id: 'u01',
      name: 'L.M.R.C. Bandara',
      email: 'instructor@skillnest.edu',
      bio: 'Senior Lecturer in Software Engineering & Internet Application Development at SEUSL.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
    status: 'draft',
    rating: 4.7,
    enrolledCount: 0,
    prerequisites: ['Basic relational database concepts'],
    learningOutcomes: ['Design 3NF normalized relational schemas'],
    structures: [],
  },
];

export const courseService = {
  getPublicCourses: async (params) => {
    try {
      const res = await api.get('/courses', { params });
      return res.data;
    } catch (err) {
      console.warn('Backend unavailable, using mock dataset for public courses:', err.message);
      let list = MOCK_COURSES.filter((c) => c.status === 'approved');
      if (params?.category && params.category !== 'All') {
        list = list.filter((c) => c.category === params.category);
      }
      if (params?.level && params.level !== 'All Levels') {
        list = list.filter((c) => c.level === params.level);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
      }
      return { success: true, count: list.length, total: list.length, totalPages: 1, courses: list };
    }
  },

  getInstructorCourses: async () => {
    try {
      const res = await api.get('/courses/my-courses');
      return res.data;
    } catch (err) {
      console.warn('Backend unavailable, using mock dataset for instructor courses:', err.message);
      return { success: true, count: MOCK_COURSES.length, courses: MOCK_COURSES };
    }
  },

  getInstructorStats: async () => {
    try {
      const res = await api.get('/courses/stats/summary');
      return res.data;
    } catch (err) {
      return {
        success: true,
        stats: {
          totalCourses: MOCK_COURSES.length,
          approvedCourses: MOCK_COURSES.filter((c) => c.status === 'approved').length,
          pendingCourses: MOCK_COURSES.filter((c) => c.status === 'pending_approval').length,
          draftCourses: MOCK_COURSES.filter((c) => c.status === 'draft').length,
          rejectedCourses: MOCK_COURSES.filter((c) => c.status === 'rejected').length,
          totalTopics: 5,
          totalMaterials: 5,
        },
      };
    }
  },

  getCourseById: async (id) => {
    try {
      const res = await api.get(`/courses/${id}`);
      return res.data;
    } catch (err) {
      console.warn('Backend unavailable, using mock dataset for course details:', err.message);
      const found = MOCK_COURSES.find((c) => c._id === id) || MOCK_COURSES[0];
      return { success: true, course: found };
    }
  },

  createCourse: async (data) => {
    try {
      const res = await api.post('/courses', data);
      return res.data;
    } catch (err) {
      const newCourse = {
        _id: 'c_' + Date.now(),
        ...data,
        status: 'draft',
        instructor: { name: 'L.M.R.C. Bandara', email: 'instructor@skillnest.edu' },
        structures: [],
      };
      MOCK_COURSES.unshift(newCourse);
      return { success: true, course: newCourse };
    }
  },

  updateCourse: async (id, data) => {
    try {
      const res = await api.put(`/courses/${id}`, data);
      return res.data;
    } catch (err) {
      const idx = MOCK_COURSES.findIndex((c) => c._id === id);
      if (idx !== -1) {
        MOCK_COURSES[idx] = { ...MOCK_COURSES[idx], ...data };
        return { success: true, course: MOCK_COURSES[idx] };
      }
      return { success: true, course: data };
    }
  },

  deleteCourse: async (id) => {
    try {
      const res = await api.delete(`/courses/${id}`);
      return res.data;
    } catch (err) {
      const idx = MOCK_COURSES.findIndex((c) => c._id === id);
      if (idx !== -1) MOCK_COURSES.splice(idx, 1);
      return { success: true, message: 'Deleted successfully (mock)' };
    }
  },

  submitCourseForApproval: async (id) => {
    try {
      const res = await api.patch(`/courses/${id}/submit`);
      return res.data;
    } catch (err) {
      const found = MOCK_COURSES.find((c) => c._id === id);
      if (found) found.status = 'pending_approval';
      return { success: true, message: 'Course submitted for administrator review (mock)' };
    }
  },
};

export const topicService = {
  addTopic: async (courseId, data) => {
    try {
      const res = await api.post(`/courses/${courseId}/topics`, data);
      return res.data;
    } catch (err) {
      const newTopic = {
        _id: 't_' + Date.now(),
        course: courseId,
        title: data.title,
        description: data.description || '',
        durationMinutes: data.durationMinutes || 45,
        order: 99,
        materials: [],
      };
      const course = MOCK_COURSES.find((c) => c._id === courseId);
      if (course) {
        course.structures = course.structures || [];
        course.structures.push(newTopic);
      }
      return { success: true, topic: newTopic };
    }
  },

  deleteTopic: async (topicId) => {
    try {
      const res = await api.delete(`/topics/${topicId}`);
      return res.data;
    } catch (err) {
      return { success: true, message: 'Topic deleted (mock)' };
    }
  },
};

export const materialService = {
  createMaterial: async (topicId, formDataOrJson) => {
    try {
      const isFormData = formDataOrJson instanceof FormData;
      const res = await api.post(`/topics/${topicId}/materials`, formDataOrJson, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      });
      return res.data;
    } catch (err) {
      const newMat = {
        _id: 'm_' + Date.now(),
        topic: topicId,
        title: formDataOrJson.title || 'New Material',
        materialType: formDataOrJson.materialType || 'notes',
        content: formDataOrJson.content || '',
        resourceLocation: formDataOrJson.resourceLocation || '',
        order: 1,
      };
      return { success: true, material: newMat };
    }
  },

  deleteMaterial: async (materialId) => {
    try {
      const res = await api.delete(`/materials/${materialId}`);
      return res.data;
    } catch (err) {
      return { success: true, message: 'Material deleted (mock)' };
    }
  },
};

export default api;

