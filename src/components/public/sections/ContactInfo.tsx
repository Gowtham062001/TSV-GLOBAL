import React from "react";

export interface ContactInfoItem {
  title: string;
  value: string;
  icon: string;
  delay: string;
}

export interface ContactInfoProps {
  eyebrow: string;
  heading: string;
  highlight: string;
  description: string;
  info: ContactInfoItem[];
}

export const ContactInfo: React.FC<ContactInfoProps> = ({
  eyebrow,
  heading,
  highlight,
  description,
  info
}) => {
  return (
    <div className="col-lg-5 sm-padding">
      <div className="section-heading mb-40">
        <h3 className="sub-heading is-border border-anim">
          {eyebrow}<span className="sh-underline"><img className="sh-truck" src="/img/truck.svg" alt="truck" /></span>
        </h3>
        <h2 className="text-anim">
          {heading} <br /><span className="hl">{highlight}</span>
        </h2>
        <p className="text-anim">
          {description}
        </p>
      </div>
      <ul className="contact-info-list">
        {info?.map((item, index) => (
          <li className="wow fade-in-bottom" data-wow-delay={item.delay} key={index}>
            <i className={item.icon}></i>
            <h3>{item.title} <span>{item.value}</span></h3>
          </li>
        ))}
      </ul>
    </div>
  );
};
