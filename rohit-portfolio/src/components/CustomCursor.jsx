import { useEffect, useRef } from 'react';

export default function CustomCursor() {
    const dotRef = useRef(null);
    const ringRef = useRef(null);
    const pos = useRef({ x: 0, y: 0 });
    const ringPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (isMobile) return;

        document.body.style.cursor = 'none';

        function onMouseMove(e) {
            pos.current = { x: e.clientX, y: e.clientY };
            if (dotRef.current) {
                dotRef.current.style.left = e.clientX + 'px';
                dotRef.current.style.top = e.clientY + 'px';
            }
        }

        function animate() {
            ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.15;
            ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.15;
            if (ringRef.current) {
                ringRef.current.style.left = ringPos.current.x + 'px';
                ringRef.current.style.top = ringPos.current.y + 'px';
            }
            requestAnimationFrame(animate);
        }

        function onHoverStart() { document.body.classList.add('cursor-hover'); }
        function onHoverEnd() { document.body.classList.remove('cursor-hover'); }

        document.addEventListener('mousemove', onMouseMove);
        animate();

        const hoverTargets = document.querySelectorAll('a, button, .glass-card, [role="button"]');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', onHoverStart);
            el.addEventListener('mouseleave', onHoverEnd);
        });

        // Reattach on DOM changes
        const observer = new MutationObserver(() => {
            const targets = document.querySelectorAll('a, button, .glass-card, [role="button"]');
            targets.forEach(el => {
                el.removeEventListener('mouseenter', onHoverStart);
                el.removeEventListener('mouseleave', onHoverEnd);
                el.addEventListener('mouseenter', onHoverStart);
                el.addEventListener('mouseleave', onHoverEnd);
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            observer.disconnect();
            document.body.style.cursor = '';
        };
    }, []);

    return (
        <>
            <div ref={dotRef} className="custom-cursor-dot" />
            <div ref={ringRef} className="custom-cursor-ring" />
        </>
    );
}
