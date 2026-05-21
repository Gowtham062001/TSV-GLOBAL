"use client";

import React from "react";

export interface SimpleContentProps {
  title?: string;
  content: string; // HTML allowed
}

export const SimpleContent: React.FC<SimpleContentProps> = ({ title, content }) => {
  return (
    <section className="padding bg-white">
      <div className="container">
        {title && <h2 className="mb-4 text-3xl font-bold text-[#2C368F]">{title}</h2>}
        <div 
          className="prose prose-lg max-w-none text-gray-600 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content ?? "" }}
        />
      </div>
    </section>
  );
};
