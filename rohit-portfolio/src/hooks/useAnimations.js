import { useEffect, useRef, useState, useCallback } from 'react';

export function useScrollReveal(threshold = 0.05) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Force reveal after a safety timeout in case observer never fires
        const safetyTimer = setTimeout(() => {
            setVisible(true);
        }, 4000);

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(el);
                    clearTimeout(safetyTimer);
                }
            },
            {
                threshold: Math.min(threshold, 0.05),
                rootMargin: '0px 0px -30px 0px'
            }
        );
        observer.observe(el);
        return () => {
            observer.disconnect();
            clearTimeout(safetyTimer);
        };
    }, [threshold]);

    return [ref, visible];
}

export function useCountUp(end, duration = 2000, startOnVisible = false) {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(!startOnVisible);
    const startFn = useCallback(() => setStarted(true), []);

    useEffect(() => {
        if (!started) return;
        const numEnd = parseFloat(end);
        if (isNaN(numEnd)) { setCount(end); return; }

        let start = 0;
        const increment = numEnd / (duration / 16);
        const isFloat = String(end).includes('.');

        const timer = setInterval(() => {
            start += increment;
            if (start >= numEnd) {
                setCount(isFloat ? numEnd.toFixed(1) : Math.ceil(numEnd));
                clearInterval(timer);
            } else {
                setCount(isFloat ? start.toFixed(1) : Math.ceil(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [end, duration, started]);

    return [count, startFn];
}
