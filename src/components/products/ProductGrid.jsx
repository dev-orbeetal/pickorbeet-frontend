export default function ProductGrid({ children, className = '', sidebar = false }) {
  const classes = ['product-grid', sidebar ? 'is-sidebar' : '', className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}
