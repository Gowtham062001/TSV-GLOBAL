import React from "react";
import { TSVHeading, TSVSubHeading } from "../shared/TSVHeading";

interface TestimonialItem {
  name: string;
  company: string;
  text: string;
  avatarColor: string;
  avatarIcon: string;
  rating: number;
}

interface TestimonialsProps {
  subHeading?: string;
  heading?: string; // Fallback
  headingPrefix?: string;
  headingHighlight?: string;
  headingSuffix?: string;
  headingBreak?: boolean;
  description?: string;
  testimonials?: TestimonialItem[];
}

export const Testimonials: React.FC<TestimonialsProps> = ({
  subHeading,
  heading,
  headingPrefix,
  headingHighlight,
  headingSuffix,
  headingBreak,
  description,
  testimonials = []
}) => {
  return (
    <section className="testimonial-section padding">
      <div className="map-pattern"></div>
      <div className="container">
        <div className="tsv-testi-wrap">
          <div className="section-heading text-center mb-30">
            {subHeading ? (
              <TSVSubHeading text={subHeading} />
            ) : (
              <TSVSubHeading text="Clients Testimonials!" />
            )}
            
            {(headingPrefix || headingHighlight) ? (
              <TSVHeading 
                prefix={headingPrefix}
                highlight={headingHighlight}
                suffix={headingSuffix}
                hasBreak={headingBreak}
              />
            ) : (
              <h2 className="text-anim" data-effect="fade-in-right" data-split="char" data-delay="0.3" data-duration="1">
                {heading || "What Our Clients Say!"}
              </h2>
            )}
            <p>{description || "Real feedback from businesses that trust TSV Global Solutions."}</p>
          </div>

          <div className="tsv-tcard-grid">
            {testimonials.map((item, index) => (
              <div className="tsv-tc wow fade-in-bottom" key={index} data-wow-delay={`${index * 0.1}s`}>
                <div className="tsv-tc-qdrop">&ldquo;</div>
                <div className="tsv-tc-stars">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <i key={i} className="fa-sharp fa-solid fa-star"></i>
                  ))}
                </div>
                <p className="tsv-tc-text">{item.text}</p>
                <div className="tsv-tc-bar"></div>
                <div className="tsv-tc-author">
                  <div className="tsv-tc-ava" style={{ background: item.avatarColor || "#c1000a" }}>
                    <i className={`fa-solid ${item.avatarIcon || "fa-user"}`}></i>
                  </div>
                  <div>
                    <div className="tsv-tc-name">{item.name}</div>
                    <div className="tsv-tc-co">{item.company}</div>
                    <div className="tsv-tc-badge"><i className="fa-solid fa-circle-check"></i> Verified Client</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
