import React from "react";

export interface JourneyCardItem {
  title: string;
  text: string;
  link: string;
  btnText: string;
  borderColor: string;
  btnBg?: string;
  delay: string;
}

export interface JourneyCardsProps {
  cards: JourneyCardItem[];
}

export const JourneyCards: React.FC<JourneyCardsProps> = ({ cards }) => {
  return (
    <section className="padding">
      <div className="container">
        <div className="row gy-4">
          {cards?.map((card, index) => (
            <div className={`col-lg-6 wow ${index % 2 === 0 ? 'fade-in-left' : 'fade-in-right'}`} data-wow-delay={card.delay} key={index}>
              <div
                style={{
                  background: "#fff",
                  padding: "40px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 25px rgba(0,0,0,0.07)",
                  borderLeft: `5px solid ${card.borderColor}`,
                  height: "100%"
                }}
              >
                <h3 style={{ fontSize: "24px", marginBottom: "15px", color: "#1a1a2e" }}>{card.title}</h3>
                <p style={{ color: "#666", marginBottom: "20px" }}>{card.text}</p>
                <a href={card.link} className="default-btn"
                  style={{ padding: "10px 20px", fontSize: "14px", background: card.btnBg || "#c1000a" }}>
                  {card.btnText}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
