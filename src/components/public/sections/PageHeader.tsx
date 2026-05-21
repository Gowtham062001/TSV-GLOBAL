import React from "react";

export interface PageHeaderProps {
  eyebrow: string;
  heading: string;
  highlight: string;
  description: string;
  bgImage?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, heading, highlight, description, bgImage }) => {
  return (
    <section 
      className="page-header" 
      style={bgImage ? { 
        backgroundImage: `linear-gradient(rgba(14, 14, 32, 0.7), rgba(14, 14, 32, 0.85)), url(${bgImage})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      } : undefined}
    >
      <div className="container">
        <div className="page-header-info">
          <h4>{eyebrow}</h4>
          <h2 dangerouslySetInnerHTML={{ __html: heading || "" }} />
          <p>{description}</p>
        </div>
      </div>
    </section>
  );
};
