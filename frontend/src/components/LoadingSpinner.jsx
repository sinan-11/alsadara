const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} border-gray-200 border-t-indigo-500 rounded-full animate-spin`} />
      {text && <p className="text-sm font-medium text-gray-400">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
