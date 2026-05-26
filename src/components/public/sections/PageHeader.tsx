import React from "react";

export interface PageHeaderProps {
  eyebrow?: string;
  subHeading?: string;
  badgeText?: string;
  heading: string;
  highlight?: string;
  description?: string;
  bgImage?: string;
  textColor?: string;
  subTextColor?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  eyebrow, 
  subHeading,
  badgeText,
  heading, 
  highlight, 
  description, 
  bgImage,
  textColor,
  subTextColor
}) => {
  const displayEyebrow = eyebrow || subHeading || badgeText || "";
  
  return (
    <section 
      className="page-header" 
      style={{
        ...(bgImage ? { 
          backgroundImage: `linear-gradient(rgba(14, 14, 32, 0.7), rgba(14, 14, 32, 0.85)), url(${bgImage})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        } : {}),
        color: textColor || undefined
      }}
    >
      <div className="container">
        <div className="page-header-info">
          {displayEyebrow && (
            <h4 style={subTextColor ? { color: subTextColor } : undefined}>
              {displayEyebrow}
            </h4>
          )}
          <h2 
            style={textColor ? { color: textColor } : undefined} 
            dangerouslySetInnerHTML={{ __html: heading || "" }} 
          />
          {description && (
            <p style={textColor ? { color: textColor, opacity: 0.9 } : undefined}>
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
