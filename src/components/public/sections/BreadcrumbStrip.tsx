import React from "react";
import Link from "next/link";

export interface BreadcrumbStripProps {
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
  highlightColor?: string;
  items?: Array<{
    label: string;
    link?: string;
  }>;
}

export const BreadcrumbStrip: React.FC<BreadcrumbStripProps> = ({ 
  bgColor = "#1a1a2e",
  borderColor = "rgba(255, 255, 255, 0.05)",
  textColor = "rgba(255, 255, 255, 0.7)",
  highlightColor = "#c1000a",
  items = [
    { label: "Home", link: "/" },
    { label: "Section", link: "#" },
    { label: "Current Page" }
  ]
}) => {
  return (
    <div 
      className="py-4 border-t" 
      style={{ 
        backgroundColor: bgColor, 
        borderColor: borderColor 
      }}
    >
      <div className="container">
        <div className="flex items-center gap-2 text-[14px] flex-wrap">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <React.Fragment key={index}>
                {isLast ? (
                  <span 
                    className="font-bold truncate" 
                    style={{ color: highlightColor }}
                  >
                    {item.label}
                  </span>
                ) : (
                  <>
                    {item.link ? (
                      <Link 
                        href={item.link} 
                        className="font-semibold transition-colors hover:opacity-100"
                        style={{ color: textColor }}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span 
                        className="font-semibold"
                        style={{ color: textColor }}
                      >
                        {item.label}
                      </span>
                    )}
                    <i 
                      className="fa-regular fa-chevron-right text-[10px]" 
                      style={{ color: textColor, opacity: 0.5 }}
                    ></i>
                  </>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
