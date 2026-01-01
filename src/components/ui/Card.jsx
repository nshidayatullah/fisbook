const Card = ({ children, className = "", padding = "md", hover = false, ...props }) => {
  const paddings = {
    none: "",
    sm: "p-5",
    md: "p-8",
    lg: "p-10",
    xl: "p-12",
  };

  return (
    <div
      className={`
        bg-white rounded-2xl shadow-sm border border-slate-100
        ${paddings[padding]}
        ${hover ? "transition-all duration-200 hover:shadow-md hover:border-slate-200" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = "" }) => <div className={`mb-6 ${className}`}>{children}</div>;

const CardTitle = ({ children, className = "" }) => <h3 className={`text-lg font-semibold text-slate-900 ${className}`}>{children}</h3>;

const CardDescription = ({ children, className = "" }) => <p className={`text-sm text-slate-500 mt-2 ${className}`}>{children}</p>;

const CardContent = ({ children, className = "" }) => <div className={`py-2 ${className}`}>{children}</div>;

const CardFooter = ({ children, className = "" }) => <div className={`mt-6 pt-6 border-t border-slate-100 ${className}`}>{children}</div>;

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
