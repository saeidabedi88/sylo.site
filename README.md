# Acetec Content Manager

A simple content management system for planning, AI-generating, and publishing content to WordPress blogs, Facebook, and Instagram.

## Features

- Content planning and calendar view
- Platform-specific content (WordPress, Facebook, Instagram)
- AI content generation (future integration with GPT-4o)
- Approval workflow
- Scheduled publishing

## Tech Stack

- **Backend:** Express.js
- **Database:** SQLite with Sequelize ORM
- **Frontend:** EJS templates with Bootstrap
- **AI Integration:** OpenAI GPT-4o (future)

## Setup Instructions

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=3001
   NODE_ENV=development
   
   # OpenAI API
   OPENAI_API_KEY=your_openai_key
   
   # WordPress
   WORDPRESS_USERNAME=your_wp_username
   WORDPRESS_PASSWORD=your_wp_password
   
   # Facebook
   FACEBOOK_APP_ID=your_fb_app_id
   FACEBOOK_APP_SECRET=your_fb_app_secret
   FACEBOOK_ACCESS_TOKEN=your_fb_access_token
   FACEBOOK_PAGE_ID=your_fb_page_id
   
   # Instagram
   INSTAGRAM_APP_ID=your_ig_app_id
   INSTAGRAM_APP_SECRET=your_ig_app_secret
   INSTAGRAM_ACCESS_TOKEN=your_ig_access_token
   INSTAGRAM_ACCOUNT_ID=your_ig_account_id
   ```
4. Start the development server
   ```
   npm run dev
   ```
5. Open your browser to `http://localhost:3001`

## Publishing System

The application includes a comprehensive publishing system for automating content delivery:

### Manual Publishing

Content can be manually published from the web interface after it has been generated and approved.

1. Create content (or use monthly plan generator)
2. Generate content with AI
3. Review and edit the generated content
4. Approve the content
5. Click "Publish" to immediately publish to the selected platform

### Scheduled Publishing

Content is automatically published on the scheduled date:

1. A cron job runs daily at 9:00 AM
2. It identifies all content items that are:
   - Scheduled for the current day
   - In "approved" status
3. Each item is published to its designated platform
4. Status is updated to "published"

### Setting Up Scheduled Publishing

Run the setup script to configure the cron job:

```bash
sh scripts/setup-cron.sh
```

### Testing Publishing

A test script is included to verify publishing functionality:

```bash
node scripts/testPublish.js
```

## Project Structure

- `app.js` - Main application file
- `models/` - Database models
- `routes/` - API routes
- `views/` - EJS templates
- `public/` - Static assets
- `config/` - Configuration files
- `services/` - Business logic and integrations
- `scripts/` - Utility scripts for maintenance and testing

## Development

Start the development server with auto-reload:

```
npm run dev
```

## Production

Start the production server:

```
npm start
```

## Future Enhancements

- OpenAI GPT-4o integration for content generation
- WordPress API integration
- Meta Graph API integration for Facebook/Instagram
- User authentication
- Analytics dashboard 