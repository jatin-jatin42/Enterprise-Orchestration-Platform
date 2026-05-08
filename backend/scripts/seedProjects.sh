#!/bin/bash

# Seed script to create dummy project data using curl
# This script will populate the database with sample projects

API_URL="http://localhost:8000/api/projects"
AUTH_TOKEN="${AUTH_TOKEN:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTFhZjIyNzE1ZTJiMWM5ZGE5YzEyMGUiLCJpYXQiOjE3NjQwNjE0NjQsImV4cCI6MTc2NDY2NjI2NH0.lh5-MA3ZzBkE1OjOvKnoxkgIeTjQ_ccdhuaH_a1EANg}"

echo "🌱 Starting to seed projects..."
echo ""

# Counter for success/failure
SUCCESS=0
FAILED=0

# Function to create a project
create_project() {
    local project_data="$1"
    local project_name="$2"
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$project_data")
    
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo "✅ Created: $project_name"
        ((SUCCESS++))
    else
        echo "❌ Failed to create $project_name (HTTP $http_code)"
        ((FAILED++))
    fi
    
    # Small delay to avoid overwhelming the API
    sleep 0.5
}

# Project 1: E-Commerce Platform
create_project '{
  "projectName": "E-Commerce Platform",
  "description": "A modern e-commerce platform with advanced features including real-time inventory management, payment processing, and customer analytics.",
  "status": "In Progress",
  "startDate": "2024-09-01",
  "endDate": "2025-06-30",
  "technologies": ["React", "Node.js", "MongoDB", "Stripe", "Redis"],
  "projectUrl": "https://ecommerce-demo.example.com",
  "repositoryUrl": "https://github.com/company/ecommerce-platform"
}' "E-Commerce Platform"

# Project 2: Mobile Health App
create_project '{
  "projectName": "Mobile Health App",
  "description": "Cross-platform mobile application for tracking health metrics, scheduling appointments, and telemedicine consultations.",
  "status": "In Progress",
  "startDate": "2024-10-15",
  "endDate": "2025-08-31",
  "technologies": ["React Native", "Firebase", "TypeScript", "GraphQL"],
  "projectUrl": "https://healthapp.example.com",
  "repositoryUrl": "https://github.com/company/health-app"
}' "Mobile Health App"

# Project 3: AI Content Generator
create_project '{
  "projectName": "AI Content Generator",
  "description": "AI-powered content generation tool using machine learning to create blog posts, social media content, and marketing copy.",
  "status": "Completed",
  "startDate": "2024-01-15",
  "endDate": "2024-11-30",
  "technologies": ["Python", "TensorFlow", "FastAPI", "PostgreSQL", "Docker"],
  "projectUrl": "https://ai-content-gen.example.com",
  "repositoryUrl": "https://github.com/company/ai-content-generator"
}' "AI Content Generator"

# Project 4: Real Estate CRM
create_project '{
  "projectName": "Real Estate CRM",
  "description": "Comprehensive CRM system for real estate agents to manage properties, clients, leads, and transactions.",
  "status": "Planning",
  "startDate": "2025-01-10",
  "endDate": "2025-10-15",
  "technologies": ["Vue.js", "Laravel", "MySQL", "AWS S3", "Tailwind CSS"],
  "projectUrl": "",
  "repositoryUrl": ""
}' "Real Estate CRM"

# Project 5: Video Streaming Platform
create_project '{
  "projectName": "Video Streaming Platform",
  "description": "Netflix-like video streaming service with content management, user subscriptions, and adaptive bitrate streaming.",
  "status": "In Progress",
  "startDate": "2024-07-01",
  "endDate": "2025-12-31",
  "technologies": ["Next.js", "AWS", "FFmpeg", "Redis", "Elasticsearch"],
  "projectUrl": "https://streaming-beta.example.com",
  "repositoryUrl": "https://github.com/company/video-platform"
}' "Video Streaming Platform"

# Project 6: Smart Home Dashboard
create_project '{
  "projectName": "Smart Home Dashboard",
  "description": "IoT dashboard for controlling and monitoring smart home devices with voice control integration.",
  "status": "On Hold",
  "startDate": "2024-03-20",
  "endDate": "2025-03-20",
  "technologies": ["Angular", "MQTT", "InfluxDB", "WebSockets"],
  "projectUrl": "",
  "repositoryUrl": "https://github.com/company/smart-home-dashboard"
}' "Smart Home Dashboard"

# Project 7: Learning Management System
create_project '{
  "projectName": "Learning Management System",
  "description": "Enterprise LMS for corporate training with course creation, progress tracking, certifications, and gamification.",
  "status": "In Progress",
  "startDate": "2024-08-01",
  "endDate": "2025-09-30",
  "technologies": ["React", "Django", "PostgreSQL", "Celery", "AWS"],
  "projectUrl": "https://lms-staging.example.com",
  "repositoryUrl": "https://github.com/company/lms-platform"
}' "Learning Management System"

# Project 8: Restaurant Management System
create_project '{
  "projectName": "Restaurant Management System",
  "description": "All-in-one solution for restaurant operations including POS, inventory, reservations, and delivery management.",
  "status": "Completed",
  "startDate": "2023-11-01",
  "endDate": "2024-09-15",
  "technologies": ["React", "Express.js", "MongoDB", "Socket.io", "Stripe"],
  "projectUrl": "https://restaurant-pos.example.com",
  "repositoryUrl": "https://github.com/company/restaurant-management"
}' "Restaurant Management System"

# Project 9: Social Media Analytics
create_project '{
  "projectName": "Social Media Analytics",
  "description": "Analytics platform for tracking social media performance across multiple platforms with AI-powered insights.",
  "status": "Planning",
  "startDate": "2025-02-01",
  "endDate": "2025-11-30",
  "technologies": ["React", "Python", "Pandas", "Chart.js", "PostgreSQL"],
  "projectUrl": "",
  "repositoryUrl": ""
}' "Social Media Analytics"

# Project 10: Project Management Tool
create_project '{
  "projectName": "Project Management Tool",
  "description": "Agile project management software with kanban boards, sprint planning, time tracking, and team collaboration features.",
  "status": "In Progress",
  "startDate": "2024-06-15",
  "endDate": "2025-05-31",
  "technologies": ["React", "TypeScript", "Node.js", "MongoDB", "WebSockets"],
  "projectUrl": "https://pm-tool-beta.example.com",
  "repositoryUrl": "https://github.com/company/pm-tool"
}' "Project Management Tool"

echo ""
echo "📊 Summary:"
echo "✅ Successfully created: $SUCCESS projects"
echo "❌ Failed: $FAILED projects"
echo ""
echo "✨ Done! Refresh your dashboard to see the projects."
