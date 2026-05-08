import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import config from '../config/config';
import User from '../models/User.model';
import Intern from '../models/Intern.model';
import ToolResource from '../models/ToolResource.model';
import LearningResource from '../models/LearningResource.model';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedAll = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB');

    // Get admin user
    const adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      console.log('❌ Admin user not found. Please run seedAdmin.ts first.');
      process.exit(1);
    }

    const adminDetails = {
      userId: adminUser._id,
      userName: adminUser.username,
      email: adminUser.email,
      role: adminUser.role,
    };

    console.log('🌱 Seeding Interns...');
    await Intern.deleteMany({});
    const interns = [];
    for (let i = 1; i <= 15; i++) {
      interns.push({
        personalInfo: {
          firstName: `Intern${i}`,
          lastName: 'Student',
          email: `intern${i}@example.com`,
          phone: `+123456789${i.toString().padStart(2, '0')}`,
        },
        internshipDetails: {
          startDate: new Date(),
          department: i % 2 === 0 ? 'Engineering' : 'Design',
          position: i % 2 === 0 ? 'Software Engineer Intern' : 'UI/UX Intern',
          status: i % 3 === 0 ? 'Completed' : 'Active',
          mentor: {
            userId: adminUser._id,
            name: adminUser.username
          }
        },
        isActive: true,
        createdBy: adminUser._id
      });
    }
    await Intern.insertMany(interns);
    console.log(`✅ Seeded 15 Interns`);

    console.log('🌱 Seeding Tools & Tech...');
    await ToolResource.deleteMany({});
    const tools = [
      { name: 'React', category: 'Frontend', url: 'https://reactjs.org' },
      { name: 'Node.js', category: 'Backend', url: 'https://nodejs.org' },
      { name: 'MongoDB', category: 'Database', url: 'https://mongodb.com' },
      { name: 'Figma', category: 'Design', url: 'https://figma.com' },
      { name: 'Docker', category: 'DevOps', url: 'https://docker.com' },
      { name: 'Jest', category: 'Testing', url: 'https://jestjs.io' },
      { name: 'Vue.js', category: 'Frontend', url: 'https://vuejs.org' },
      { name: 'PostgreSQL', category: 'Database', url: 'https://postgresql.org' },
      { name: 'Kubernetes', category: 'DevOps', url: 'https://kubernetes.io' },
      { name: 'Cypress', category: 'Testing', url: 'https://cypress.io' },
    ];
    
    const toolDocs = tools.map(t => ({
      toolName: t.name,
      category: t.category,
      officialUrl: t.url,
      pricing: 'Free',
      createdBy: adminDetails,
      isActive: true
    }));
    await ToolResource.insertMany(toolDocs);
    console.log(`✅ Seeded 10 Tools`);

    console.log('🌱 Seeding Learning Resources...');
    await LearningResource.deleteMany({});
    const resources = [
      { title: 'React Official Tutorial', cat: 'Tutorial', diff: 'Beginner' },
      { Node: 'Node.js Crash Course', cat: 'Video', diff: 'Beginner' },
      { title: 'Advanced MongoDB', cat: 'Course', diff: 'Advanced' },
      { title: 'Figma UI Design', cat: 'Video', diff: 'Intermediate' },
      { title: 'Docker for Beginners', cat: 'Article', diff: 'Beginner' },
      { title: 'Testing with Jest', cat: 'Documentation', diff: 'Intermediate' },
      { title: 'Mastering Vue 3', cat: 'Course', diff: 'Advanced' },
      { title: 'SQL Performance Tuning', cat: 'Article', diff: 'Advanced' },
      { title: 'Kubernetes in Action', cat: 'Course', diff: 'Advanced' },
      { title: 'E2E with Cypress', cat: 'Tutorial', diff: 'Intermediate' },
    ];
    
    const resourceDocs = resources.map((r, i) => ({
      title: r.title || r.Node,
      category: r.cat,
      difficulty: r.diff,
      url: `https://example.com/resource-${i}`,
      createdBy: adminDetails,
      isActive: true,
      views: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 500)
    }));
    await LearningResource.insertMany(resourceDocs);
    console.log(`✅ Seeded 10 Learning Resources`);

    console.log('\n✨ All data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedAll();
