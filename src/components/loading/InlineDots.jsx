export default function InlineDots({ className = '' }) {
  return (
    <span aria-hidden="true" className={`inline-flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="brand-loader-dot h-1.5 w-1.5 rounded-full bg-current"
          style={{ animationDelay: `${index * 0.16}s` }}
        />
      ))}
    </span>
  );
}
