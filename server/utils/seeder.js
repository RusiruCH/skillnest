const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Course = require('../models/Course');
const CourseStructure = require('../models/CourseStructure');
const LearningMaterial = require('../models/LearningMaterial');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/skillnest_db';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for database seeding...');

    // Clean existing data
    await Promise.all([
      User.deleteMany(),
      Course.deleteMany(),
      CourseStructure.deleteMany(),
      LearningMaterial.deleteMany(),
    ]);
    console.log('Cleared existing collections.');

    // 1. Create Users
    const instructor = await User.create({
      name: 'L.M.R.C. Bandara',
      email: 'instructor@skillnest.edu',
      password: 'password123',
      role: 'instructor',
      instructorStatus: 'approved',
      bio: 'Senior Lecturer in Software Engineering & Internet Application Development at SEUSL.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    });

    const learner = await User.create({
      name: 'Kamal Perera',
      email: 'learner@skillnest.edu',
      password: 'password123',
      role: 'learner',
      instructorStatus: 'none',
      bio: 'ICT Undergraduate exploring Web Technologies and Cloud Computing.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    });

    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@skillnest.edu',
      password: 'password123',
      role: 'admin',
      instructorStatus: 'none',
      bio: 'Chief Platform Administrator for SkillNest SEUSL.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    });

    console.log('Users created:');
    console.log(' - Instructor: instructor@skillnest.edu / password123');
    console.log(' - Learner:    learner@skillnest.edu / password123');
    console.log(' - Admin:      admin@skillnest.edu / password123');

    // 2. Create Course 1: MERN Stack (Approved)
    const course1 = await Course.create({
      title: 'Full-Stack Modern MERN Web Development',
      subtitle: 'Build production-ready web applications using MongoDB, Express, React, and Node.js.',
      description:
        'A comprehensive practical guide to mastering the MERN stack. Learn to architect REST APIs, manage MongoDB collections with Mongoose, build responsive single-page applications with React, and deploy full-stack solutions.',
      category: 'Web Development',
      level: 'Intermediate',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
      instructor: instructor._id,
      status: 'approved',
      reviewedBy: admin._id,
      reviewedDate: new Date(),
      prerequisites: ['Basic JavaScript (ES6+)', 'HTML & CSS Fundamentals', 'Basic understanding of HTTP'],
      learningOutcomes: [
        'Design and deploy Express.js REST APIs with robust error handling',
        'Model complex data schemas and relationships in MongoDB using Mongoose',
        'Build modular, high-performance UI components with React 18',
        'Implement JSON Web Token (JWT) authentication and role-based access control',
      ],
      tags: ['React', 'Node.js', 'Express', 'MongoDB', 'REST API'],
      enrolledCount: 142,
      rating: 4.9,
    });

    // Topics for Course 1
    const topic1_1 = await CourseStructure.create({
      course: course1._id,
      title: 'Module 1: Backend Architecture with Node.js and Express',
      description: 'Understanding event-driven I/O, middleware pipelines, and routing in Express.js.',
      order: 1,
      durationMinutes: 60,
    });

    const topic1_2 = await CourseStructure.create({
      course: course1._id,
      title: 'Module 2: Database Modeling with MongoDB & Mongoose',
      description: 'Designing collections, schemas, indexes, and document relations.',
      order: 2,
      durationMinutes: 75,
    });

    const topic1_3 = await CourseStructure.create({
      course: course1._id,
      title: 'Module 3: Frontend Client Integration with React',
      description: 'State management, custom hooks, and consuming REST endpoints with Axios.',
      order: 3,
      durationMinutes: 90,
    });

    // Materials for Topic 1_1
    await LearningMaterial.create({
      course: course1._id,
      topic: topic1_1._id,
      title: 'Express REST Server Setup & Middleware Pipeline',
      materialType: 'video',
      resourceLocation: 'https://www.youtube.com/watch?v=7H_QH9nipNs',
      content: 'In this video lecture, we cover setting up Express with CORS, dotenv, and JSON parsing middlewares.',
      durationMinutes: 24,
      order: 1,
    });

    await LearningMaterial.create({
      course: course1._id,
      topic: topic1_1._id,
      title: 'REST API Best Practices and Status Codes Reference',
      materialType: 'notes',
      content: `### REST API Architecture Rules
1. **Stateless Communication**: Every HTTP request must carry all the credentials and parameters necessary.
2. **Standard Status Codes**:
   - \`200 OK\` - Request succeeded
   - \`201 Created\` - Resource successfully persisted
   - \`400 Bad Request\` - Malformed input or missing mandatory fields
   - \`401 Unauthorized\` - Token missing or expired
   - \`403 Forbidden\` - Authenticated user lacks permission
   - \`404 Not Found\` - Resource nonexistent
   - \`500 Internal Server Error\` - Unhandled server exception
3. **Plural Nouns**: Use \`/api/courses\` instead of \`/api/getCourse\`.`,
      durationMinutes: 15,
      order: 2,
    });

    await LearningMaterial.create({
      course: course1._id,
      topic: topic1_1._id,
      title: 'Sample Express Router Boilerplate',
      materialType: 'code',
      codeLanguage: 'javascript',
      content: `const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to SkillNest Course API'
  });
});

module.exports = router;`,
      durationMinutes: 10,
      order: 3,
    });

    // Materials for Topic 1_2
    await LearningMaterial.create({
      course: course1._id,
      topic: topic1_2._id,
      title: 'Mongoose Schema Definition & Validation Guide',
      materialType: 'notes',
      content: `### Mongoose Validation Strategies
Mongoose provides built-in schema validators:
- \`required\`: Ensures mandatory data fields exist.
- \`enum\`: Restricts field values to an allowed set.
- \`match\`: Applies regular expression validation (e.g. email formatting).
- Pre-save hooks: Useful for encrypting passwords before saving to MongoDB.`,
      durationMinutes: 20,
      order: 1,
    });

    await LearningMaterial.create({
      course: course1._id,
      topic: topic1_2._id,
      title: 'MongoDB Compass Connection Guide & Query Examples',
      materialType: 'document',
      resourceLocation: 'https://www.mongodb.com/docs/compass/current/',
      content: 'Official documentation and quick reference guide for connecting MongoDB Compass to your local or Atlas cluster.',
      durationMinutes: 15,
      order: 2,
    });

    // 3. Create Course 2: Java OOP (Approved)
    const course2 = await Course.create({
      title: 'Object-Oriented Programming with Java & Design Patterns',
      subtitle: 'Master OOP principles, SOLID patterns, and software design architecture in Java.',
      description:
        'Deep dive into Encapsulation, Inheritance, Polymorphism, Abstraction, and essential Gang of Four (GoF) design patterns including Singleton, Factory, and Observer.',
      category: 'Software Engineering',
      level: 'Beginner',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      instructor: instructor._id,
      status: 'approved',
      reviewedBy: admin._id,
      reviewedDate: new Date(),
      prerequisites: ['Basic computer science literacy'],
      learningOutcomes: [
        'Apply the 4 fundamental pillars of OOP in Java',
        'Refactor monolithic codebases using SOLID principles',
        'Implement Factory, Singleton, and Observer design patterns',
      ],
      tags: ['Java', 'OOP', 'Design Patterns', 'SOLID'],
      enrolledCount: 98,
      rating: 4.8,
    });

    const topic2_1 = await CourseStructure.create({
      course: course2._id,
      title: 'Unit 1: The Four Pillars of Object Orientation',
      description: 'Encapsulation, Data Hiding, Method Overriding vs Overloading.',
      order: 1,
      durationMinutes: 50,
    });

    await LearningMaterial.create({
      course: course2._id,
      topic: topic2_1._id,
      title: 'Polymorphism and Interface Implementation in Java',
      materialType: 'code',
      codeLanguage: 'java',
      content: `public interface Printable {
    void printDetails();
}

public class Course implements Printable {
    private String title;
    
    public Course(String title) {
        this.title = title;
    }
    
    @Override
    public void printDetails() {
        System.out.println("Course Title: " + title);
    }
}`,
      durationMinutes: 15,
      order: 1,
    });

    // 4. Create Course 3: Python DSA (Pending Approval)
    const course3 = await Course.create({
      title: 'Data Structures & Algorithms in Python',
      subtitle: 'From Big-O analysis to Trees, Graphs, and Dynamic Programming.',
      description:
        'A comprehensive course designed to build algorithmic thinking. Covers Arrays, Linked Lists, Stacks, Queues, Binary Search Trees, and Graph Traversal algorithms.',
      category: 'Algorithms',
      level: 'Advanced',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      instructor: instructor._id,
      status: 'pending_approval',
      submissionDate: new Date(),
      prerequisites: ['Basic Python programming syntax'],
      learningOutcomes: [
        'Analyze asymptotic time and space complexities using Big-O notation',
        'Implement trees, heaps, and graph search algorithms from scratch',
      ],
      tags: ['Python', 'DSA', 'Algorithms', 'Data Structures'],
      enrolledCount: 0,
      rating: 5.0,
    });

    const topic3_1 = await CourseStructure.create({
      course: course3._id,
      title: 'Chapter 1: Asymptotic Complexity & Big-O Notation',
      description: 'Formal definition of Big-O, Omega, and Theta analysis.',
      order: 1,
      durationMinutes: 45,
    });

    await LearningMaterial.create({
      course: course3._id,
      topic: topic3_1._id,
      title: 'Big-O Cheat Sheet & Complexity Comparison',
      materialType: 'notes',
      content: `### Common Complexities Ranked from Best to Worst
- O(1) - Constant time
- O(log n) - Logarithmic time (Binary Search)
- O(n) - Linear time (Single Loop)
- O(n log n) - Linearithmic time (Merge Sort, Quick Sort)
- O(n^2) - Quadratic time (Nested Loops)
- O(2^n) - Exponential time (Recursive Fibonacci)`,
      durationMinutes: 20,
      order: 1,
    });

    // 5. Create Course 4: SQL Database (Draft mode)
    const course4 = await Course.create({
      title: 'Relational Database Design & SQL Optimization',
      subtitle: 'Normalization, Indexing, and Query Performance in PostgreSQL & MySQL.',
      description:
        'Hands-on relational database design course for modern internet applications. Learn ER diagramming, 1NF to BCNF normalization, and B-Tree indexing.',
      category: 'Database',
      level: 'Intermediate',
      thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
      instructor: instructor._id,
      status: 'draft',
      prerequisites: ['Basic relational database concepts'],
      learningOutcomes: ['Design 3NF normalized relational schemas', 'Write optimized SQL joins and aggregation queries'],
      tags: ['SQL', 'Database', 'PostgreSQL', 'Normalization'],
      enrolledCount: 0,
    });

    const topic4_1 = await CourseStructure.create({
      course: course4._id,
      title: 'Section 1: ER Modeling and Schema Normalization',
      description: 'Understanding functional dependencies and lossless joins.',
      order: 1,
      durationMinutes: 40,
    });

    await LearningMaterial.create({
      course: course4._id,
      topic: topic4_1._id,
      title: 'Normalization Rules from 1NF to 3NF',
      materialType: 'notes',
      content: `### Database Normalization Principles
- 1NF: Atomic values; no repeating groups.
- 2NF: 1NF + No partial dependencies on composite primary keys.
- 3NF: 2NF + No transitive dependencies on non-key attributes.`,
      durationMinutes: 15,
      order: 1,
    });

    console.log('Sample courses, topics, and materials seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();

