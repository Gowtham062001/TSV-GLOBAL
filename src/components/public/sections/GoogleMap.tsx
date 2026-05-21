import React from "react";

export interface GoogleMapProps {
  src: string;
}

export const GoogleMap: React.FC<GoogleMapProps> = ({ src }) => {
  return (
    <div className="map-wrapper">
      <iframe
        src={src}
        width="100%"
        height="400"
        frameBorder="0"
        style={{ border: 0 }}
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
};
