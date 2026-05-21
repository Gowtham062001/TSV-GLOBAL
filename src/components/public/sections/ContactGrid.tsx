"use client";
import React from "react";
import { ContactForm, ContactFormProps } from "./ContactForm";
import { ContactInfo, ContactInfoItem } from "./ContactInfo";

export interface ContactGridProps {
  form: ContactFormProps;
  info: {
    eyebrow: string;
    heading: string;
    highlight: string;
    description: string;
    list: ContactInfoItem[];
  };
}

export const ContactGrid: React.FC<ContactGridProps> = ({ form, info }) => {
  return (
    <section className="contact-section padding">
      <div className="map-pattern"></div>
      <div className="container">
        <div className="row">
          <div className="col-lg-7 sm-padding">
            <ContactForm {...form} />
          </div>
          <ContactInfo 
            eyebrow={info.eyebrow}
            heading={info.heading}
            highlight={info.highlight}
            description={info.description}
            info={info.list}
          />
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 991px) {
          .sm-padding { padding-left: 15px !important; padding-right: 15px !important; }
          .contact-form-wrap { margin-bottom: 60px; }
        }
      `}</style>
    </section>
  );
};
