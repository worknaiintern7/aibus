export const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: "0.75rem" }}>{actions}</div>}
    </div>
  );
};

export default PageHeader;
