/**
 * Seed script to create dummy project data
 * Run this script to populate the database with sample projects
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api';

// You'll need to replace this with a valid auth token
// Get it from localStorage in the browser or login first
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'YOUR_AUTH_TOKEN_HERE';

const dummyProjects = [
  {
    projectName: 'E-Commerce Platform',
    description: 'A modern e-commerce platform with advanced features including real-time inventory management, payment processing, and customer analytics.',
    status: 'In Progress',
    startDate: '2024-09-01',
    endDate: '2025-06-30',
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Redis'],
    projectUrl: 'https://ecommerce-demo.example.com',
    repositoryUrl: 'https://github.com/company/ecommerce-platform',
  },
  {
    projectName: 'Mobile Health App',
    description: 'Cross-platform mobile application for tracking health metrics, scheduling appointments, and telemedicine consultations.',
    status: 'In Progress',
    startDate: '2024-10-15',
    endDate: '2025-08-31',
    technologies: ['React Native', 'Firebase', 'TypeScript', 'GraphQL'],
    projectUrl: 'https://healthapp.example.com',
    repositoryUrl: 'https://github.com/company/health-app',
  },
  {
    projectName: 'AI Content Generator',
    description: 'AI-powered content generation tool using machine learning to create blog posts, social media content, and marketing copy.',
    status: 'Completed',
    startDate: '2024-01-15',
    endDate: '2024-11-30',
    technologies: ['Python', 'TensorFlow', 'FastAPI', 'PostgreSQL', 'Docker'],
    projectUrl: 'https://ai-content-gen.example.com',
    repositoryUrl: 'https://github.com/company/ai-content-generator',
  },
  {
    projectName: 'Real Estate CRM',
    description: 'Comprehensive CRM system for real estate agents to manage properties, clients, leads, and transactions.',
    status: 'Planning',
    startDate: '2025-01-10',
    endDate: '2025-10-15',
    technologies: ['Vue.js', 'Laravel', 'MySQL', 'AWS S3', 'Tailwind CSS'],
    projectUrl: '',
    repositoryUrl: '',
  },
  {
    projectName: 'Video Streaming Platform',
    description: 'Netflix-like video streaming service with content management, user subscriptions, and adaptive bitrate streaming.',
    status: 'In Progress',
    startDate: '2024-07-01',
    endDate: '2025-12-31',
    technologies: ['Next.js', 'AWS', 'FFmpeg', 'Redis', 'Elasticsearch'],
    projectUrl: 'https://streaming-beta.example.com',
    repositoryUrl: 'https://github.com/company/video-platform',
  },
  {
    projectName: 'Smart Home Dashboard',
    description: 'IoT dashboard for controlling and monitoring smart home devices with voice control integration.',
    status: 'On Hold',
    startDate: '2024-03-20',
    endDate: '2025-03-20',
    technologies: ['Angular', 'MQTT', 'InfluxDB', 'WebSockets'],
    projectUrl: '',
    repositoryUrl: 'https://github.com/company/smart-home-dashboard',
  },
  {
    projectName: 'Learning Management System',
    description: 'Enterprise LMS for corporate training with course creation, progress tracking, certifications, and gamification.',
    status: 'In Progress',
    startDate: '2024-08-01',
    endDate: '2025-09-30',
    technologies: ['React', 'Django', 'PostgreSQL', 'Celery', 'AWS'],
    projectUrl: 'https://lms-staging.example.com',
    repositoryUrl: 'https://github.com/company/lms-platform',
  },
  {
    projectName: 'Restaurant Management System',
    description: 'All-in-one solution for restaurant operations including POS, inventory, reservations, and delivery management.',
    status: 'Completed',
    startDate: '2023-11-01',
    endDate: '2024-09-15',
    technologies: ['React', 'Express.js', 'MongoDB', 'Socket.io', 'Stripe'],
    projectUrl: 'https://restaurant-pos.example.com',
    repositoryUrl: 'https://github.com/company/restaurant-management',
  },
  {
    projectName: 'Social Media Analytics',
    description: 'Analytics platform for tracking social media performance across multiple platforms with AI-powered insights.',
    status: 'Planning',
    startDate: '2025-02-01',
    endDate: '2025-11-30',
    technologies: ['React', 'Python', 'Pandas', 'Chart.js', 'PostgreSQL'],
    projectUrl: '',
    repositoryUrl: '',
  },
  {
    projectName: 'Project Management Tool',
    description: 'Agile project management software with kanban boards, sprint planning, time tracking, and team collaboration features.',
    status: 'In Progress',
    startDate: '2024-06-15',
    endDate: '2025-05-31',
    technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'WebSockets'],
    projectUrl: 'https://pm-tool-beta.example.com',
    repositoryUrl: 'https://github.com/company/pm-tool',
  },
];

async function createProject(projectData) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/projects`,
      projectData,
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`✅ Created: ${projectData.projectName}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to create ${projectData.projectName}:`, error.response?.data?.message || error.message);
    throw error;
  }
}

async function seedProjects() {
  console.log('🌱 Starting to seed projects...\n');

  if (AUTH_TOKEN === 'YOUR_AUTH_TOKEN_HERE') {
    console.error('❌ Error: Please set your AUTH_TOKEN');
    console.error('You can get your auth token from localStorage.getItem("auth_token") in the browser');
    console.error('Or set it as an environment variable: AUTH_TOKEN=your_token node scripts/seedProjects.js');
    process.exit(1);
  }

  let successCount = 0;
  let failCount = 0;

  for (const project of dummyProjects) {
    try {
      await createProject(project);
      successCount++;
      // Add a small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      failCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully created: ${successCount} projects`);
  console.log(`❌ Failed: ${failCount} projects`);
  console.log('\n✨ Done! Check your dashboard to see the projects.');
}

// Run the seed function
seedProjects().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
