import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://rohitranvir.vercel.app';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export default function SEO({
    title = 'Rohit Ranvir — Python Full Stack Developer & AI/ML Engineer',
    description = 'Python Full Stack Developer skilled in Django, React 19, PostgreSQL, TensorFlow & Docker. B.E. Computer Science 2025. Open to opportunities across India.',
    path = '/',
}) {
    const url = `${SITE_URL}${path}`;

    return (
        <Helmet>
            {/* Primary */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            {/* Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={OG_IMAGE} />
            <meta property="og:site_name" content="Rohit Ranvir Portfolio" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={OG_IMAGE} />

            {/* Extra */}
            <meta name="author" content="Rohit Ranvir" />
            <meta name="keywords" content="Rohit Ranvir, Python Developer, Django, React, Full Stack, AI ML, Portfolio, TensorFlow, PostgreSQL" />
            <meta name="theme-color" content="#080808" />
        </Helmet>
    );
}
