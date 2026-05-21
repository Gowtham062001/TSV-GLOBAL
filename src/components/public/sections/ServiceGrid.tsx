import React from "react";

export interface ServiceItem {
  title: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
}

export interface ServiceGridProps {
  eyebrow?: string;
  heading?: string;
  highlight?: string;
  services?: ServiceItem[]; // If provided, use these, else we can fetch in the parent
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({ eyebrow, heading, highlight, services }) => {
  return (
    <section className="service-section bg-grey padding">
      <div className="map-pattern"></div>
      <div className="container">
        {(eyebrow || heading) && (
          <div className="section-heading text-center mb-40 wow fade-in-bottom" data-wow-delay="200ms">
            {eyebrow && <h4 className="sub-heading">{eyebrow}</h4>}
            {heading && <h2>{heading} <span className="hl">{highlight}</span></h2>}
          </div>
        )}
        <div className="row gy-4">
          {services?.map((service, index) => (
            <div className="col-lg-4 col-md-6 flex" key={index}>
              <div className="service-item wow fade-in-bottom flex flex-col w-full h-full" data-wow-delay={`${(index + 1) * 100}ms`}>
                <div className="service-thumb h-[240px] shrink-0">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                </div>
                <div className="service-content flex flex-col flex-1">
                  <div className="service-icon"><i className={service.icon}></i></div>
                  <h3><a href={`/services/${service.slug}`}>{service.title}</a></h3>
                  <p className="flex-1">{service.description}</p>
                  <a className="read-more mt-auto" href={`/services/${service.slug}`}>Read More</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
