import React from 'react';

/**
 * ErrorBoundary — catches React render errors and shows a
 * branded fallback screen instead of a blank white page.
 *
 * Usage in App.jsx:
 *   <ErrorBoundary>
 *     <SmoothScroll> ... </SmoothScroll>
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, info: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // In production you'd send this to Sentry / LogRocket
        console.error('[ErrorBoundary] Caught error:', error, info);
        this.setState({ info });
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        const { error } = this.state;

        return (
            <div
                style={{
                    minHeight: '100vh',
                    background: '#080808',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    fontFamily: "'DM Sans', sans-serif",
                    textAlign: 'center',
                }}
            >
                {/* Gold accent line at top */}
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
                    }}
                />

                {/* Logo */}
                <div
                    style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '1.8rem',
                        color: '#C9A84C',
                        letterSpacing: '0.2em',
                        marginBottom: 48,
                        fontWeight: 600,
                    }}
                >
                    RR
                </div>

                {/* Error icon box */}
                <div
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: 'rgba(201, 168, 76, 0.08)',
                        border: '1px solid rgba(201, 168, 76, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 32,
                        fontSize: '1.8rem',
                    }}
                >
                    ⚠
                </div>

                {/* Heading */}
                <h1
                    style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: 400,
                        color: '#F5F5F0',
                        marginBottom: 16,
                        lineHeight: 1.2,
                    }}
                >
                    Something went wrong
                </h1>

                {/* Subtext */}
                <p
                    style={{
                        color: '#888880',
                        fontSize: '0.95rem',
                        lineHeight: 1.7,
                        maxWidth: 480,
                        marginBottom: 40,
                    }}
                >
                    An unexpected error occurred while rendering this page.
                    Refreshing usually fixes it — sorry for the interruption.
                </p>

                {/* Error detail (dev only) */}
                {import.meta.env.DEV && error && (
                    <details
                        style={{
                            maxWidth: 560,
                            width: '100%',
                            marginBottom: 32,
                            background: 'rgba(239, 68, 68, 0.06)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: 8,
                            padding: '12px 16px',
                            textAlign: 'left',
                            cursor: 'pointer',
                        }}
                    >
                        <summary
                            style={{
                                color: '#ef4444',
                                fontFamily: "'Space Mono', monospace",
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                marginBottom: 8,
                            }}
                        >
                            Error details (dev mode)
                        </summary>
                        <pre
                            style={{
                                color: '#ef4444',
                                fontSize: '0.72rem',
                                fontFamily: "'Space Mono', monospace",
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                margin: 0,
                                opacity: 0.85,
                            }}
                        >
                            {error.toString()}
                        </pre>
                    </details>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px 32px',
                            background: '#C9A84C',
                            color: '#080808',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={e => (e.target.style.opacity = '0.85')}
                        onMouseLeave={e => (e.target.style.opacity = '1')}
                    >
                        Refresh Page
                    </button>

                    <button
                        onClick={() => { window.location.href = '/'; }}
                        style={{
                            padding: '12px 32px',
                            background: 'transparent',
                            color: '#C9A84C',
                            border: '1px solid rgba(201, 168, 76, 0.3)',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '0.85rem',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            transition: 'border-color 0.2s',
                        }}
                        onMouseEnter={e => (e.target.style.borderColor = '#C9A84C')}
                        onMouseLeave={e => (e.target.style.borderColor = 'rgba(201, 168, 76, 0.3)')}
                    >
                        Go Home
                    </button>
                </div>

                {/* Bottom gold line */}
                <div
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
                    }}
                />
            </div>
        );
    }
}
