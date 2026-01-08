// frontend/src/data/mockProjects.ts

export const MOCK_PROJECTS_DATA = {
  success: true,
  message: "Projects fetched successfully",
  data: [
    {
      "_id": "proj_001",
      "projectName": "AI Analytics Dashboard",
      "description": "A comprehensive dashboard for visualizing AI-driven insights and predictive analytics for retail clients.",
      "status": "In Progress",
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-08-30T00:00:00.000Z",
      "projectUrl": "https://analytics-dev.company.com",
      "repositoryUrl": "https://github.com/company/ai-analytics",
      "documentationUrl": "https://docs.company.com/ai-analytics",
      "technologies": [
        "React",
        "TypeScript",
        "Python",
        "TensorFlow",
        "AWS"
      ],
      "teamMembers": [
        {
          "_id": "tm_101",
          "memberId": "user_55",
          "memberType": "User",
          "name": "Sarah Jenkins",
          "role": "Tech Lead",
          "joinedAt": "2024-01-15T00:00:00.000Z"
        },
        {
          "_id": "tm_102",
          "memberId": "intern_08",
          "memberType": "Intern",
          "name": "Mike Ross",
          "role": "Frontend Developer",
          "joinedAt": "2024-02-01T00:00:00.000Z"
        }
      ],
      "pdfDocuments": [
        {
          "_id": "doc_1",
          "title": "System Architecture v1.0",
          "url": "https://s3.aws.com/docs/arch-v1.pdf",
          "uploadedAt": "2024-01-20T10:30:00.000Z"
        }
      ],
      "isActive": true,
      "createdAt": "2024-01-10T09:00:00.000Z",
      "updatedAt": "2024-03-15T14:20:00.000Z"
    },
    {
      "_id": "proj_002",
      "projectName": "Internal HR Portal",
      "description": "Modernizing the legacy HR system to support remote onboarding and automated payroll processing.",
      "status": "Planning",
      "startDate": "2024-06-01T00:00:00.000Z",
      "endDate": "2024-12-20T00:00:00.000Z",
      "technologies": [
        "Vue.js",
        "Node.js",
        "PostgreSQL",
        "Docker"
      ],
      "teamMembers": [],
      "isActive": true,
      "createdAt": "2024-04-05T11:00:00.000Z",
      "updatedAt": "2024-04-05T11:00:00.000Z"
    },
    {
      "_id": "proj_003",
      "projectName": "Mobile App Redesign",
      "description": "Complete UI/UX overhaul of the customer-facing mobile application to improve accessibility and engagement.",
      "status": "Completed",
      "startDate": "2023-09-01T00:00:00.000Z",
      "endDate": "2024-02-28T00:00:00.000Z",
      "projectUrl": "https://play.google.com/store/apps/details?id=com.company.app",
      "technologies": [
        "React Native",
        "Firebase",
        "Redux"
      ],
      "teamMembers": [
        {
          "_id": "tm_103",
          "memberId": "user_22",
          "memberType": "User",
          "name": "David Chen",
          "role": "Senior Mobile Dev",
          "joinedAt": "2023-09-01T00:00:00.000Z"
        },
        {
          "_id": "tm_104",
          "memberId": "intern_12",
          "memberType": "Intern",
          "name": "Emma Watson",
          "role": "UI/UX Designer",
          "joinedAt": "2023-09-15T00:00:00.000Z"
        }
      ],
      "isActive": true,
      "createdAt": "2023-08-25T09:30:00.000Z",
      "updatedAt": "2024-03-01T10:00:00.000Z"
    },
    {
      "_id": "proj_004",
      "projectName": "Legacy Data Migration",
      "description": "Migrating 10 years of historical data from on-premise servers to cloud storage. Currently paused due to budget constraints.",
      "status": "On Hold",
      "startDate": "2023-11-01T00:00:00.000Z",
      "endDate": "2024-04-01T00:00:00.000Z",
      "technologies": [
        "Python",
        "SQL",
        "Azure Blob Storage"
      ],
      "teamMembers": [
        {
          "_id": "tm_105",
          "memberId": "user_88",
          "memberType": "User",
          "name": "Robert Fox",
          "role": "Backend Engineer",
          "joinedAt": "2023-11-01T00:00:00.000Z"
        }
      ],
      "isActive": true,
      "createdAt": "2023-10-20T13:45:00.000Z",
      "updatedAt": "2024-02-10T09:15:00.000Z"
    },
    {
      "_id": "proj_005",
      "projectName": "E-commerce Recommendation Engine",
      "description": "Building a collaborative filtering engine to suggest products to users based on browsing history.",
      "status": "In Progress",
      "startDate": "2024-02-10T00:00:00.000Z",
      "endDate": "2024-07-15T00:00:00.000Z",
      "repositoryUrl": "https://gitlab.company.com/backend/rec-engine",
      "technologies": [
        "Python",
        "Scikit-learn",
        "FastAPI",
        "Redis"
      ],
      "teamMembers": [
        {
          "_id": "tm_106",
          "memberId": "intern_15",
          "memberType": "Intern",
          "name": "Jessica Lee",
          "role": "Data Science Intern",
          "joinedAt": "2024-02-12T00:00:00.000Z"
        },
        {
          "_id": "tm_107",
          "memberId": "intern_16",
          "memberType": "Intern",
          "name": "Tom Harris",
          "role": "Backend Intern",
          "joinedAt": "2024-02-12T00:00:00.000Z"
        }
      ],
      "isActive": true,
      "createdAt": "2024-02-01T08:00:00.000Z",
      "updatedAt": "2024-03-20T16:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
};