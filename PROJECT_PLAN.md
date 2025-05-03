# Content Management System MVP Plan

## Overview
A simple content management system for planning, AI-generating, and publishing content to WordPress blogs, Facebook, and Instagram for Acetec.ca.

## Architecture
- **Single Express.js App** (server-rendered with EJS templates)
- **No separate frontend/backend** to avoid port conflicts and API issues
- **SQLite database** for simple persistence without setup
- **Environment variable configuration** with fallback values

## Core Features

### 1. Content Calendar View
- Simple table showing planned content
- Filter by platform (WordPress/Facebook/Instagram)
- Monthly view with status indicators

### 2. Content Planning
- Form with: Topic, Keywords, Platform selection, Publish date
- Choose package size (8/12/16 pieces monthly)
- Simple validation to prevent duplicates

### 3. AI Generation
- Single GPT-4o integration for both text and image content
- Platform-specific templates:
  - WordPress: SEO-optimized blog post with featured image
  - Facebook: Caption with engaging image
  - Instagram: Caption with visual-focused image
- One-click generation from plan details

### 4. Approval & Publishing
- Review/edit generated content
- One-click publishing to selected platform
- Scheduled publishing based on planned date

## Technical Implementation
- **Server**: Express.js on port 3001 (avoids macOS conflicts)
- **Database**: SQLite with Sequelize ORM
- **Templates**: EJS for server-side rendering
- **API Handling**: Native fetch with proper error handling (no axios)
- **Configuration**: .env file with NODE_ENV and PORT variables
- **CSS Framework**: Simple Bootstrap for quick styling

## Workflow Process
1. **Plan**: Create content plans with topic, platform, and date
2. **Generate**: Use GPT-4o to create drafts and images
3. **Review/Edit**: Modify AI-generated content as needed
4. **Publish**: Send approved content to target platforms

## Development Phases
1. **Phase 1**: Project setup, database models, calendar view + planning interface
2. **Phase 2**: GPT-4o integration for content generation
3. **Phase 3**: Basic WordPress publishing API
4. **Phase 4**: Social media publishing APIs

## Error Prevention Strategies
- Server-side validation for all forms
- Try/catch blocks around all third-party API calls
- Environment-based configuration
- API keys stored server-side only
- Relative URLs throughout the application
- Fallback ports to avoid conflicts

## Future Enhancements (Post-MVP)
- User authentication
- Analytics dashboard
- Content performance tracking
- Multiple user roles
- Enhanced AI customization options 