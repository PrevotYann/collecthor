import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/PokemonCardDetails.css"; // Create a separate CSS file for this view

const FFTCGCardDetails = () => {
  const location = useLocation();
  // eslint-disable-next-line no-unused-vars
  const [card, setCard] = useState(location.state?.card || {});
  const [imageUrl, setImageUrl] = useState(null);
  const fallbackImageUrl = "/pokemon_back_card.webp"; // Fallback image

  // Parsing attack and weaknesses if they are stored as strings
  useEffect(() => {
    if (card.full_image) {
      setImageUrl(card.full_image);
    }
  }, [card]);

  return (
    <div className="pokemon-card-details">
      <div className="card-header">
        <img
          src={imageUrl ? imageUrl : fallbackImageUrl}
          alt={card.name}
          className="pokemon-card-image"
        />
        <div className="card-info">
          <h2>{card.name}</h2>
          <br />
          <p className="card-rarity">Rarity: {card.rarity}</p>
          {card.variant_firstEdition && <p>First Edition</p>}
        </div>
      </div>

      {card.text && (
        <div className="card-description">
          <h3>Description</h3>
          <p>{card.text}</p>
        </div>
      )}

      {card.power && (
        <div className="card-description">
          <h3>Power</h3>
          <p>{card.power}</p>
        </div>
      )}

      {card.job && (
        <div className="card-description">
          <h3>Job</h3>
          <p>{card.job}</p>
        </div>
      )}

      {card.lang && (
        <div className="card-language">
          <h3>Language</h3>
          <p>{card.lang}</p>
        </div>
      )}
    </div>
  );
};

export default FFTCGCardDetails;
