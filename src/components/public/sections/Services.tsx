import React from "react";
import Link from "next/link";
import Image from "next/image";
import { TSVHeading, TSVSubHeading } from "../shared/TSVHeading";

export interface ServiceItemProps {
  title: string;
  description: string;
  icon: string;
  image: string;
  imageAlt?: string;
  link: string;
  delay?: string;
}

export interface ServicesProps {
  subHeading?: string;
  heading?: string; // Fallback
  headingPrefix?: string;
  headingHighlight?: string;
  headingSuffix?: string;
  headingBreak?: boolean;
  description?: string;
  items: ServiceItemProps[];
}

export const Services: React.FC<ServicesProps> = ({
  subHeading,
  heading,
  headingPrefix,
  headingHighlight,
  headingSuffix,
  headingBreak,
  description,
  items
}) => {
  return (
    <section className="service-section bg-grey padding">
      <div className="map-pattern"></div>
      <div className="container">
        <div className="section-heading text-center mb-40">
          {subHeading && <TSVSubHeading text={subHeading} />}
          
          {(headingPrefix || headingHighlight) ? (
            <TSVHeading 
              prefix={headingPrefix}
              highlight={headingHighlight}
              suffix={headingSuffix}
              hasBreak={headingBreak}
            />
          ) : (
            <h2 className="text-anim" data-effect="fade-in-right" data-split="char" data-delay="0.3" data-duration="1">
              {heading}
            </h2>
          )}
          
          {description && (
            <p className="text-anim" data-effect="fade-in-bottom" data-ease="power4.out">
              {description}
            </p>
          )}
        </div>
        <div className="row gy-4">
          {items && items.map((service, index) => (
            <div className="col-lg-4 col-md-6" key={index} style={{ display: 'flex' }}>
              <div 
                className="service-item wow fade-in-bottom" 
                data-wow-delay={service.delay || `${(index * 200) + 100}ms`}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  width: '100%', 
                  background: '#fff',
                  marginBottom: '30px'
                }}
              >
                <div className="service-thumb shrink-0" style={{ position: "relative", width: "100%", height: "240px", overflow: "hidden" }}>
                  <Image src={service.image} alt={service.imageAlt || service.title} fill style={{ objectFit: "cover" }} />
                </div>
                <div className="service-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '60px 40px 30px' }}>
                  <div className="service-icon"><i className={service.icon}></i></div>
                  <h3 style={{ marginBottom: '15px' }}><Link href={service.link}>{service.title}</Link></h3>
                  <p style={{ flex: 1, marginBottom: '20px' }}>{service.description}</p>
                  <Link 
                    className="read-more" 
                    href={service.link}
                    style={{ alignSelf: 'flex-start', position: 'relative', left: 0, bottom: 0, marginTop: 'auto' }}
                  >
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
