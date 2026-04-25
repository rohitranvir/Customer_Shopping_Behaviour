/**
 * Case study content for the 4 main portfolio projects.
 * Keyed by project slug (used in URL: /projects/:slug).
 */

const caseStudies = {
    'vendor-connect-india': {
        id: 'vendor-connect-india',
        title: 'Vendor Connect India',
        pitch: 'A hyper-local B2B/B2C marketplace connecting street vendors with nearby customers across India.',
        category: 'Web Dev',
        tech: ['Django', 'MongoDB Atlas', 'React 19', 'Leaflet.js', 'Razorpay', 'Docker', 'JWT', 'Cloudinary'],
        githubUrl: 'https://github.com/rohitranvir',
        liveUrl: '',
        featured: true,

        problem: {
            statement: 'Street vendors across India lack digital presence. Customers can\'t discover local vendors, compare products, or make secure payments. There is no unified platform that bridges the gap between hyper-local vendors and tech-savvy customers.',
            audience: 'Small-scale vendors (food stalls, repair shops, artisans) and local customers who want to discover, browse, and transact with nearby businesses.',
        },

        architecture: `
┌──────────────┐     ┌──────────────────┐     ┌───────────────┐
│   React 19   │────▶│  Django REST API  │────▶│  MongoDB Atlas │
│   Frontend   │     │   (DRF + JWT)     │     │   (Database)   │
└──────────────┘     └──────────────────┘     └───────────────┘
       │                      │
       │                      ├──── Razorpay Payment Gateway
       │                      ├──── Cloudinary (Image CDN)
       ▼                      ▼
┌──────────────┐     ┌──────────────────┐
│  Leaflet.js  │     │     Docker       │
│  (Live Maps) │     │  (Containerised) │
└──────────────┘     └──────────────────┘
        `,

        techDecisions: [
            {
                question: 'Why MongoDB over PostgreSQL?',
                answer: 'Vendor profiles have highly variable schemas — food vendors need menu arrays, service vendors need pricing tiers, artisans need gallery fields. MongoDB\'s flexible document model handles this naturally without complex migrations.',
            },
            {
                question: 'Why Leaflet.js over Google Maps?',
                answer: 'Zero API costs. Leaflet with OpenStreetMap tiles provides the same geocoding and marker clustering capabilities without per-request billing — critical for a startup MVP targeting scale.',
            },
            {
                question: 'Why Razorpay?',
                answer: 'Best-in-class UPI support for Indian users. Their Test Mode allowed full payment flow development without processing real money. One-line integration via their React SDK.',
            },
        ],

        features: [
            { icon: '🗺️', title: 'Interactive Vendor Map', desc: 'Real-time Leaflet.js map with marker clustering, geo-filtered search by radius, and category-based vendor pins.' },
            { icon: '💳', title: 'Secure Payments', desc: 'Razorpay integration with server-side signature verification, refund handling, and webhook-based order status updates.' },
            { icon: '🔐', title: 'JWT Authentication', desc: 'Token-based auth with access/refresh flow, role-based permissions (vendor vs customer), and secure password reset.' },
            { icon: '🐳', title: 'Dockerised Deployment', desc: 'Multi-container Docker Compose setup: Django API, React frontend, MongoDB, and Nginx reverse proxy — one command to deploy.' },
        ],

        challenges: [
            {
                problem: 'Map performance degrades with 500+ vendor markers on mobile.',
                solution: 'Implemented Leaflet\'s MarkerClusterGroup plugin to automatically group nearby markers at lower zoom levels. Added debounced map-bounds API calls to only fetch vendors within the visible viewport.',
            },
            {
                problem: 'Razorpay webhook signature verification was failing in local development.',
                solution: 'Built a mock payment simulation system that auto-completes payment flow in development mode using environment-based conditional logic, while keeping production webhook verification intact.',
            },
            {
                problem: 'MongoDB queries were slow for location-based vendor searches.',
                solution: 'Created 2dsphere geospatial indexes on the vendor collection and used $near aggregation operator with maxDistance filtering — reduced query time from 800ms to under 50ms.',
            },
        ],

        results: [
            { metric: '50+', label: 'Vendors Onboarded' },
            { metric: '< 50ms', label: 'Geo-query Speed' },
            { metric: '100%', label: 'Mobile Responsive' },
            { metric: '1-cmd', label: 'Docker Deploy' },
        ],

        nextSteps: [
            'Add real-time order tracking with WebSocket notifications',
            'Implement vendor analytics dashboard with revenue charts',
            'Add multi-language support (Hindi, Marathi, Telugu)',
            'Deploy to AWS ECS with auto-scaling and CloudFront CDN',
        ],
    },

    'multi-tenant-saas-expense-manager': {
        id: 'multi-tenant-saas-expense-manager',
        title: 'Multi-Tenant SaaS Expense Manager',
        pitch: 'Enterprise-grade expense tracking with PostgreSQL schema-level tenant isolation, async processing, and CI/CD.',
        category: 'Web Dev',
        tech: ['Django', 'PostgreSQL', 'Celery', 'Redis', 'React', 'GitHub Actions', 'JWT', 'Chart.js'],
        githubUrl: 'https://github.com/rohitranvir',
        liveUrl: '',
        featured: true,

        problem: {
            statement: 'Small-to-medium organisations need expense management but can\'t afford Concur or Expensify. Most open-source alternatives lack multi-tenancy, meaning a single deployment can\'t serve multiple companies securely.',
            audience: 'Startups and SMEs (10-200 employees) that need team expense tracking, approval workflows, and budget reporting without enterprise pricing.',
        },

        architecture: `
┌──────────────┐     ┌────────────────────┐     ┌──────────────┐
│    React     │────▶│ Django REST API     │────▶│  PostgreSQL  │
│   Frontend   │     │ (Multi-Tenant)      │     │  (Schemas)   │
└──────────────┘     └────────────────────┘     └──────────────┘
                              │                        │
                     ┌────────┴────────┐      ┌────────┴───────┐
                     │     Celery      │      │  Tenant Schema │
                     │  (Async Tasks)  │      │   Isolation    │
                     └────────┬────────┘      │  ┌──────────┐  │
                              │               │  │ tenant_a  │  │
                     ┌────────┴────────┐      │  │ tenant_b  │  │
                     │      Redis      │      │  │ tenant_c  │  │
                     │  (Task Broker)  │      │  └──────────┘  │
                     └─────────────────┘      └────────────────┘
                              │
                     ┌────────┴────────┐
                     │  GitHub Actions │
                     │   (CI/CD)       │
                     └─────────────────┘
        `,

        techDecisions: [
            {
                question: 'Why PostgreSQL schemas over row-level filtering?',
                answer: 'Schema-level isolation guarantees zero data leakage between tenants. Even a buggy query can\'t accidentally expose Tenant A\'s data to Tenant B. It also enables per-tenant backups and migration flexibility.',
            },
            {
                question: 'Why Celery + Redis over Django\'s async views?',
                answer: 'Expense report generation involves aggregating thousands of rows, generating PDFs, and sending emails — tasks that take 10-30 seconds. Celery moves these to background workers so the API stays responsive.',
            },
            {
                question: 'Why GitHub Actions over Jenkins?',
                answer: 'Zero infrastructure to maintain. The YAML-based workflow runs tests on every PR, deploys to staging on merge to develop, and auto-deploys to production on release tags.',
            },
        ],

        features: [
            { icon: '🏢', title: 'Multi-Tenant Architecture', desc: 'PostgreSQL schema-per-tenant isolation with middleware-based automatic schema routing from subdomain or JWT claims.' },
            { icon: '📊', title: 'Real-time Dashboards', desc: 'Chart.js-powered analytics showing monthly spend, category breakdowns, budget utilisation, and team-level expense comparisons.' },
            { icon: '⚙️', title: 'Async Report Generation', desc: 'Celery workers generate expense PDFs, monthly summaries, and CSV exports in the background with real-time progress via Redis pub/sub.' },
            { icon: '🔄', title: 'CI/CD Pipeline', desc: 'GitHub Actions runs pytest, flake8, and builds on every push. Auto-deploys to staging on merge — manual promote to production.' },
        ],

        challenges: [
            {
                problem: 'Schema switching middleware conflicted with Django Admin — admin tried to access tenant schemas.',
                solution: 'Created a middleware whitelist for admin paths that forces the "public" schema, while all API routes resolve tenant from the JWT token\'s org_id claim.',
            },
            {
                problem: 'Celery tasks couldn\'t determine which tenant schema to use.',
                solution: 'Passed schema_name as a task argument and created a custom Celery base task class that activates the correct PostgreSQL schema before execution and resets it after.',
            },
        ],

        results: [
            { metric: '50+', label: 'Organisations Supported' },
            { metric: '60%', label: 'Time Saved on Reports' },
            { metric: '0', label: 'Cross-tenant Data Leaks' },
            { metric: '< 30s', label: 'CI Pipeline Runtime' },
        ],

        nextSteps: [
            'Add Stripe billing for per-tenant subscription management',
            'Implement approval workflow engine with configurable rules',
            'Add SSO support via SAML 2.0 / OAuth',
            'Implement read-replica routing for heavy analytics queries',
        ],
    },

    'youtube-comment-sentiment-analysis': {
        id: 'youtube-comment-sentiment-analysis',
        title: 'YouTube Comment Sentiment Analysis',
        pitch: 'CNN-based deep learning model classifying YouTube comments with 85%+ accuracy. Published in IJISRT 2025.',
        category: 'ML & AI',
        tech: ['TensorFlow', 'Keras', 'CNN', 'Flask', 'NLP', 'NLTK', 'NumPy', 'Pandas'],
        githubUrl: 'https://github.com/rohitranvir',
        liveUrl: '',
        featured: false,
        highlight: 'Published IJISRT Paper — DOI: IJISRT25FEB1017',

        problem: {
            statement: 'Content creators and brands receive thousands of YouTube comments daily. Manually gauging audience sentiment is impossible at scale. Existing tools use basic keyword matching that misses sarcasm, context, and mixed sentiments.',
            audience: 'YouTube content creators, digital marketers, and brand managers who need automated sentiment insights from comment sections.',
        },

        architecture: `
┌───────────────┐     ┌─────────────────┐     ┌───────────────┐
│  YouTube API  │────▶│ Data Pipeline   │────▶│  Preprocessed │
│  (Comments)   │     │ (NLTK + Pandas) │     │   Dataset     │
└───────────────┘     └─────────────────┘     └───────────────┘
                                                      │
                                              ┌───────┴───────┐
                                              │  CNN Model    │
                                              │  (TensorFlow) │
                                              │  ┌─────────┐  │
                                              │  │Embedding │  │
                                              │  │Conv1D x3 │  │
                                              │  │MaxPool   │  │
                                              │  │Dense+SM  │  │
                                              │  └─────────┘  │
                                              └───────┬───────┘
                                                      │
                              ┌────────────────────────┴──────┐
                              │      Flask Web Interface      │
                              │  Input URL → Scrape → Predict │
                              │  → Visualize Sentiment Chart  │
                              └───────────────────────────────┘
        `,

        techDecisions: [
            {
                question: 'Why CNN over LSTM for text classification?',
                answer: 'CNNs with 1D convolutions excel at capturing local n-gram patterns (bigrams, trigrams) which are the primary indicators of sentiment in short comments. They\'re also 3x faster to train than LSTMs for this task size.',
            },
            {
                question: 'Why Flask over Django for the web interface?',
                answer: 'The web layer is just a thin inference endpoint — no ORM, no admin, no auth needed. Flask\'s minimal footprint keeps the Docker image under 200MB compared to 500MB+ with Django.',
            },
            {
                question: 'Why custom preprocessing over pre-trained transformers?',
                answer: 'BERT/GPT models are 440MB+ and require GPU inference. Our NLTK pipeline (tokenize → lemmatize → remove stopwords → pad) runs on CPU in under 10ms per comment, enabling real-time batch analysis.',
            },
        ],

        features: [
            { icon: '🧠', title: 'CNN Architecture', desc: '3-layer 1D CNN with embedding (128-dim), Conv1D filters (64/128/256), MaxPooling, and Dense softmax output for 3-class sentiment.' },
            { icon: '📈', title: 'Sentiment Visualisation', desc: 'Real-time pie charts and bar graphs showing positive/negative/neutral distribution across a video\'s comment section.' },
            { icon: '🔗', title: 'URL-based Analysis', desc: 'Paste any YouTube URL → system scrapes comments via API → preprocesses → batch predicts → renders interactive dashboard.' },
            { icon: '📝', title: 'Published Research', desc: 'Full research paper published in IJISRT (International Journal of Innovative Science and Research Technology), Feb 2025.' },
        ],

        challenges: [
            {
                problem: 'Model accuracy plateaued at 72% with basic bag-of-words approach.',
                solution: 'Switched to trainable word embeddings (128-dim) fed into stacked Conv1D layers with increasing filter sizes. Added dropout (0.5) between dense layers to prevent overfitting. Accuracy jumped to 85.2%.',
            },
            {
                problem: 'YouTube API rate limits caused scraping failures on videos with 10K+ comments.',
                solution: 'Implemented exponential backoff with jitter, paginated fetching with nextPageToken, and a local SQLite cache to avoid re-fetching already-analyzed comments.',
            },
            {
                problem: 'Comments with emojis, Hindi-English code-mixing, and slang broke the tokenizer.',
                solution: 'Added custom preprocessing: emoji-to-text mapping (😊→happy), regex-based transliteration for common Hindi words, and a slang dictionary for YouTube-specific terms.',
            },
        ],

        results: [
            { metric: '85.2%', label: 'Test Accuracy' },
            { metric: '10K+', label: 'Comments Analysed' },
            { metric: '< 10ms', label: 'Per-comment Inference' },
            { metric: 'IJISRT', label: 'Published Paper' },
        ],

        nextSteps: [
            'Fine-tune a DistilBERT model for comparison benchmarks',
            'Add aspect-based sentiment (video quality, audio, content)',
            'Deploy as a Chrome extension for in-page YouTube analysis',
            'Support multilingual comments (Hindi, Spanish, Portuguese)',
        ],
    },

    'smartreview-ai': {
        id: 'smartreview-ai',
        title: 'SmartReview AI',
        pitch: 'AI-powered automated code review tool with Monaco Editor integration and LLM-driven suggestions.',
        category: 'ML & AI',
        tech: ['Django', 'LLM Integration', 'React', 'Monaco Editor', 'Python', 'REST API'],
        githubUrl: 'https://github.com/rohitranvir',
        liveUrl: '',
        featured: false,

        problem: {
            statement: 'Manual code reviews are bottlenecks in development pipelines. Junior developers wait hours for senior review. Existing linters catch syntax issues but miss logic errors, security vulnerabilities, and code quality improvements.',
            audience: 'Development teams (2-20 engineers), coding bootcamp students, and freelance developers who need instant, intelligent code feedback.',
        },

        architecture: `
┌──────────────────┐     ┌─────────────────────┐
│   React + Monaco │────▶│ Django REST API      │
│   Code Editor    │     │ (Code Submission)    │
└──────────────────┘     └──────────┬──────────┘
                                    │
                           ┌────────┴────────┐
                           │  LLM Service    │
                           │  (AI Analysis)  │
                           │  ┌────────────┐ │
                           │  │ Prompt Eng. │ │
                           │  │ Context Mgr │ │
                           │  │ Response    │ │
                           │  │ Parser      │ │
                           │  └────────────┘ │
                           └────────┬────────┘
                                    │
                           ┌────────┴────────┐
                           │ Review Results  │
                           │ • Issues Found  │
                           │ • Suggestions   │
                           │ • Best Practice │
                           │ • Security Scan │
                           └─────────────────┘
        `,

        techDecisions: [
            {
                question: 'Why Monaco Editor over CodeMirror?',
                answer: 'Monaco (the engine behind VS Code) provides IntelliSense, syntax highlighting for 50+ languages, diff views, and inline decorations — all needed for displaying review annotations directly in the editor.',
            },
            {
                question: 'Why Django over FastAPI for this project?',
                answer: 'Needed Django Admin for managing prompt templates, review history, and user quotas. Django\'s ORM and migration system also simplified the database layer vs raw SQL with FastAPI.',
            },
            {
                question: 'Why custom prompt engineering over a fine-tuned model?',
                answer: 'Fine-tuning requires thousands of labeled code reviews and costs $100+ per training run. Prompt engineering with few-shot examples achieves 90%+ relevant suggestions at zero training cost.',
            },
        ],

        features: [
            { icon: '✏️', title: 'Monaco Code Editor', desc: 'VS Code-quality editing experience with syntax highlighting, auto-complete, line-level review annotations, and split diff views.' },
            { icon: '🤖', title: 'AI-Powered Analysis', desc: 'LLM-driven code review that detects bugs, security vulnerabilities, performance issues, and provides refactoring suggestions with explanations.' },
            { icon: '📋', title: 'Structured Reports', desc: 'Review results categorised by severity (Critical/Warning/Info) with inline code suggestions and one-click apply for recommended fixes.' },
            { icon: '🔄', title: 'Multi-Language Support', desc: 'Supports Python, JavaScript, Java, C++, and Go — each with language-specific prompt templates for accurate domain-aware reviews.' },
        ],

        challenges: [
            {
                problem: 'LLM responses were inconsistent — sometimes JSON, sometimes plain text, sometimes truncated.',
                solution: 'Built a structured prompt template with explicit JSON schema instructions and a response parser with fallback regex extraction. Added retry logic with temperature reduction on parse failures.',
            },
            {
                problem: 'Monaco Editor re-rendered on every state update, losing cursor position and scroll state.',
                solution: 'Used React refs to store editor instance, implemented controlled mode with onChange debouncing (300ms), and used Monaco\'s built-in deltaDecorations API for annotations instead of full re-renders.',
            },
        ],

        results: [
            { metric: '90%+', label: 'Relevant Suggestions' },
            { metric: '< 5s', label: 'Review Response Time' },
            { metric: '5+', label: 'Languages Supported' },
            { metric: '50+', label: 'Prompt Templates' },
        ],

        nextSteps: [
            'Add GitHub PR integration for automated review on push',
            'Implement review history with diff tracking over time',
            'Add team-level code standards configuration',
            'Fine-tune a lightweight model for common Python patterns',
        ],
    },
};

export default caseStudies;
