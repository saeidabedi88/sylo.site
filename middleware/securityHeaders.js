const securityHeaders = (req, res, next) => {
    // HTTP Strict Transport Security
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy
    res.setHeader('Content-Security-Policy', `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
        style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
        img-src 'self' data: https:;
        font-src 'self' https://cdn.jsdelivr.net;
        connect-src 'self';
        frame-ancestors 'none';
        form-action 'self';
    `.replace(/\s+/g, ' ').trim());

    // Permissions Policy
    res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');

    next();
};

module.exports = securityHeaders; 