"use client";
export interface TeamGridProps {
  subHeading?: string;
  heading?: string;
  description?: string;
  members?: Array<{
    name: string;
    position: string;
    image: string;
    socials?: { fb?: string; twitter?: string; instagram?: string; linkedin?: string };
  }>;
}

export function TeamGrid({
  subHeading = "Dedicated Transportation Team",
  heading = "Deliver Fast <span class='hl'>Efficient</span><br>Transportation!",
  description = "TSV Global specializes in managing the transportation storage and distribution of goods.",
  members = [
    { name: "Phillip Hancock", position: "Fleet Supervisor", image: "/assets/img/team-1.jpg" },
    { name: "Ronald Hedges", position: "Dispatcher", image: "/assets/img/team-2.jpg" },
    { name: "Amber Wilson", position: "Logistics Coordinator", image: "/assets/img/team-3.jpg" },
    { name: "Michael Torres", position: "Operations Manager", image: "/assets/img/team-4.jpg" },
  ],
}: TeamGridProps) {
  return (
    <section className="team-section position-relative padding">
      <div className="cargo-container wow fade-in-top" data-wow-delay="100ms"></div>
      <div className="container">
        <div className="section-heading text-center mb-40 mt-50">
          <h3 className="sub-heading is-border border-anim">
            {subHeading}
            <span className="sh-underline">
              <img className="sh-truck" src="/assets/img/truck.svg" alt="truck" />
            </span>
          </h3>
          <h2 className="text-anim" data-effect="fade-in-right" data-split="char" data-delay="0.3" data-duration="1"
            dangerouslySetInnerHTML={{ __html: heading ?? "" }} />
          <p className="text-anim" data-effect="fade-in-bottom" data-ease="power4.out">{description}</p>
        </div>
        <div className="row gy-lg-0 gy-4">
          {members.map((member, i) => (
            <div className="col-lg-3 col-md-6" key={i}>
              <div className="team-item wow fade-in-bottom" data-wow-delay={`${(i + 1) * 200}ms`}>
                <div className="team-thumb">
                  <img src={member.image} alt={member.name} />
                  <ul className="team-social">
                    <li><a href={member.socials?.fb || "#"}><i className="fa-brands fa-facebook-f"></i></a></li>
                    <li><a href={member.socials?.twitter || "#"}><i className="fa-brands fa-x-twitter"></i></a></li>
                    <li><a href={member.socials?.instagram || "#"}><i className="fa-brands fa-instagram"></i></a></li>
                    <li><a href={member.socials?.linkedin || "#"}><i className="fa-brands fa-linkedin-in"></i></a></li>
                  </ul>
                </div>
                <div className="team-content">
                  <h4 className="position">{member.position}</h4>
                  <h3><a href="/about">{member.name}</a></h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 991px) {
          .cargo-container { display: none !important; }
          .section-heading h2 { font-size: 28px !important; }
        }
      `}</style>
    </section>
  );
}
