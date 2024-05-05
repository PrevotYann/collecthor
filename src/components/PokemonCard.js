import React from "react";
import "../styles/PokemonCard.css"; // Path to CSS file

const PokemonCard = ({ card }) => {
  // Fallback image URL
  const fallbackImageUrl = "/pokemon_back_card.webp";

  return (
    <div className="pokemon-card-container">
      <div className="pokemon-card-image">
        <img
          src={
            card.image !== null
              ? card.image + process.env.REACT_APP_POKEMON_IMAGE_SUFFIX
              : fallbackImageUrl
          }
          alt={card.name}
        />
      </div>
      <div className="pokemon-card-details">
        <h2>{card.name}</h2>
        <p>
          <strong>Language:</strong> {card.language}
        </p>
        <p>
          <strong>Rarity:</strong> {card.rarity}
        </p>
        <p>
          <strong>Rarity:</strong> {card.rarity}
        </p>
        <p>
          <strong>Stage:</strong> {card.stage}
        </p>
      </div>
    </div>
  );
};

export default PokemonCard;
