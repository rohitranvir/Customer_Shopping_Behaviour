export default function WhatsAppButton() {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER || '91XXXXXXXXXX'
  const text = encodeURIComponent("Hello! I have a query about Tea3 Café.")
  const link = `https://wa.me/${number}?text=${text}`

  return (
    <>
      <a href={link} target="_blank" rel="noopener noreferrer" className="wa-float" aria-label="Chat on WhatsApp">
        <i className="fa-brands fa-whatsapp" />
      </a>
      <style>{`
        .wa-float {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background-color: #25D366;
          color: white;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
          z-index: 1000;
          transition: transform 0.3s ease;
          animation: pulse-green 2s infinite;
        }
        .wa-float:hover {
          transform: scale(1.1);
        }
        @keyframes pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
        }
        @media (max-width: 768px) {
          .wa-float { bottom: 20px; right: 20px; width: 50px; height: 50px; font-size: 1.6rem; }
        }
      `}</style>
    </>
  )
}
