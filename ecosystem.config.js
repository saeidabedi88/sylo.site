module.exports = {
    apps: [{
        name: 'sylo-site',
        script: 'app.js',
        env: {
            NODE_ENV: 'production',
            PORT: 3001,
            JWT_SECRET: 'your-secure-jwt-secret-key-change-this-in-production',
            JWT_EXPIRES_IN: '2h',
            OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'your-openai-api-key'
        },
        watch: false,
        max_memory_restart: '1G',
        error_file: 'logs/err.log',
        out_file: 'logs/out.log',
        time: true
    }]
}; 