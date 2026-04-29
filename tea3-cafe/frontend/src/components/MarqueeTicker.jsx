export default function MarqueeTicker() {
  return (
    <div className="marquee-wrapper">
      <div className="marquee-content">
        <span>Single Origin Tea • Fresh Baked Daily • Live Music Fridays • Open 8AM–10PM • Hyderabad's Finest Tea3 Café • </span>
        <span>Single Origin Tea • Fresh Baked Daily • Live Music Fridays • Open 8AM–10PM • Hyderabad's Finest Tea3 Café • </span>
      </div>

      <style>{`
        .marquee-wrapper {
          width: 100%;
          background: var(--espresso);
          border-top: 1px solid rgba(201, 168, 76, 0.2);
          border-bottom: 1px solid rgba(201, 168, 76, 0.2);
          overflow: hidden;
          padding: 0.8rem 0;
          white-space: nowrap;
          position: relative;
        }
        .marquee-content {
          display: inline-block;
          animation: marquee 25s linear infinite;
        }
        .marquee-content span {
          color: var(--gold);
          font-family: var(--font-heading);
          font-size: 1rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-right: 0.5rem;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
