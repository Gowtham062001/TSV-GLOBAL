import React from "react";

export interface VisionMissionProps {
  heading: string;
  subheading: string;
  vision: { title: string; text: string; icon: string };
  mission: { title: string; text: string; icon: string };
}

export const VisionMission: React.FC<VisionMissionProps> = ({ heading, subheading, vision, mission }) => {
  return (
    <section className="padding bg-grey">
      <div className="container">
        <div className="section-heading text-center mb-40 wow fade-in-bottom" data-wow-delay="200ms">
          <h4 className="sub-heading">{subheading}</h4>
          <h2>{heading}</h2>
        </div>
        <div className="row gy-4 tsv-vm-container">
          <div className="col-lg-6 wow fade-in-left" data-wow-delay="300ms">
            <div className="tsv-vm-card vision">
              <div className="tsv-vm-icon">
                <i className={vision.icon}></i>
              </div>
              <div className="tsv-vm-content">
                <h3>{vision.title}</h3>
                <p>{vision.text}</p>
              </div>
            </div>
          </div>
          <div className="col-lg-6 wow fade-in-right" data-wow-delay="400ms">
            <div className="tsv-vm-card mission">
              <div className="tsv-vm-icon">
                <i className={mission.icon}></i>
              </div>
              <div className="tsv-vm-content">
                <h3>{mission.title}</h3>
                <p>{mission.text}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
