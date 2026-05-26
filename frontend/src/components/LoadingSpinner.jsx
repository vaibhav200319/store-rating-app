const LoadingSpinner = ({ label = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-indigo-500" />
    <p className="text-sm text-slate-400">{label}</p>
  </div>
);

export default LoadingSpinner;
