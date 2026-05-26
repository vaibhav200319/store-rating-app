const Card = ({ title, children, className = "" }) => (
  <div
    className={`rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur ${className}`}
  >
    {title && <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>}
    {children}
  </div>
);

export default Card;
