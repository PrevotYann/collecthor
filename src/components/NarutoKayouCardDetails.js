import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/NarutoKayouCardDetails.css"; // Create a separate CSS file for this view

const NarutoKayouCardDetails = () => {
  const location = useLocation();
  const [card, setCard] = useState(location.state?.card || {});
  const [imageUrl, setImageUrl] = useState(null);
  const fallbackImageUrl = "/naruto_back_card.webp"; // Fallback image

  // Set the card image URL
  useEffect(() => {
    if (card.image) {
      setImageUrl(card.image);
    }
  }, [card]);

  return (
    <div className="naruto-kayou-card-details">
      <div className="card-header">
        <img
          src={imageUrl ? imageUrl : fallbackImageUrl}
          alt={card.name}
          className="naruto-card-image"
        />
        <div className="card-info">
          <h2>{card.name}</h2>
          <p className="card-code">
            <strong>Code:</strong> {card.code}
          </p>
          <p className="card-extension">
            <strong>Extension:</strong> {card.extension}
          </p>
        </div>
      </div>

      <div className="card-attributes">
        {card.attack !== null && (
          <p>
            <strong>Attack:</strong> {card.attack}
          </p>
        )}
        {card.defense !== null && (
          <p>
            <strong>Defense:</strong> {card.defense}
          </p>
        )}
        {card.chakra !== null && (
          <p>
            <strong>Chakra:</strong> {card.chakra}
          </p>
        )}
      </div>

      {card.description && (
        <div className="card-description">
          <h3>Description</h3>
          <p>{card.description}</p>
        </div>
      )}
    </div>
  );
};

export default NarutoKayouCardDetails;
