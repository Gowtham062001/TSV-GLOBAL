import React from "react";

export interface WhoWeAreProps {
  eyebrow: string;
  heading: string;
  highlight: string;
  paragraphs: string[];
  checklist: string[];
  image: string;
  imageAlt?: string;
  since: string;
}

export const WhoWeAre: React.FC<WhoWeAreProps> = ({
  eyebrow,
  heading,
  highlight,
  paragraphs,
  checklist,
  image,
  imageAlt,
  since
}) => {
  return (
    <section className="about-section padding">
      <div className="container">
        <div className="row align-items-center gy-4">
          <div className="col-lg-6 wow fade-in-left" data-wow-delay="200ms">
            <div className="about-img-wrap mt-30" style={{ position: "relative" }}>
              <img src={image} alt={imageAlt || "TSV Global"}
                style={{ width: "100%", height: "450px", objectFit: "cover", borderRadius: "10px" }} />
              <div className="about-img-info"
                style={{ position: "absolute", bottom: "20px", left: "20px", background: "#c1000a", color: "#fff", padding: "14px 24px", borderRadius: "6px", fontWeight: 700, fontSize: "18px" }}>
                Since {since}</div>
            </div>
          </div>
          <div className="col-lg-6 wow fade-in-right" data-wow-delay="300ms">
            <div className="section-heading mb-30">
              <h4 className="sub-heading">{eyebrow}</h4>
              <h2>{heading} <span className="hl">{highlight}</span></h2>
            </div>
            {paragraphs?.map((p, index) => (
              <p key={index} style={{ marginTop: index > 0 ? "15px" : "0" }}>{p}</p>
            ))}
            <ul className="check-list mb-20 mt-20 wow fade-in-bottom" data-wow-delay="400ms">
              {checklist?.map((item, index) => (
                <li key={index}><i className="fa-solid fa-check"></i>{item}</li>
              ))}
            </ul>
            <div className="btn-group mt-30 wow fade-in-bottom" data-wow-delay="500ms">
              <a href="/contact" className="default-btn">Get In Touch</a>
              <div className="call-info" style={{ marginLeft: "20px" }}>
                <i className="fa-light fa-phone"></i>
                <h3>Call Us <span>+91 96001 32975</span></h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
