import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/PokemonCardDetails.css"; // Create a separate CSS file for this view

const PokemonCardDetails = () => {
  const location = useLocation();
  // eslint-disable-next-line no-unused-vars
  const [card, setCard] = useState(location.state?.card || {});
  const [attacks, setAttacks] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
  const [types, setTypes] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const fallbackImageUrl = "/pokemon_back_card.webp"; // Fallback image

  // Parsing attack and weaknesses if they are stored as strings
  useEffect(() => {
    if (card.attacks) {
      setAttacks(JSON.parse(card.attacks));
    }
    if (card.weaknesses) {
      setWeaknesses(JSON.parse(card.weaknesses));
    }
    if (card.types) {
      setTypes(JSON.parse(card.types));
    }
    if (card.image) {
      setImageUrl(card.image + process.env.REACT_APP_POKEMON_IMAGE_SUFFIX);
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
          <p className="card-illustrator">
            Illustrator: {card.illustrator || "Unknown"}
          </p>
          {card.variant_firstEdition && <p>First Edition</p>}
        </div>
      </div>

      {attacks.length > 0 && (
        <div className="card-attacks">
          <h3>Attacks</h3>
          <ul>
            {attacks.map((attack, index) => (
              <li key={index}>
                <strong>{attack.name}</strong> (Cost: {attack.cost.join(", ")})
                - <span>{attack.effect}</span>
                <div>Damage: {attack.damage}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {weaknesses.length > 0 && (
        <div className="card-weaknesses">
          <h3>Weaknesses</h3>
          <ul>
            {weaknesses.map((weakness, index) => (
              <li key={index}>
                Type: {weakness.type}, Multiplier: {weakness.value}
              </li>
            ))}
          </ul>
        </div>
      )}

      {types.length > 0 && (
        <div className="card-types">
          <h3>Types</h3>
          <ul>
            {types.map((type, index) => (
              <li key={index}>{type}</li>
            ))}
          </ul>
        </div>
      )}

      {card.description && (
        <div className="card-description">
          <h3>Description</h3>
          <p>{card.description}</p>
        </div>
      )}

      {card.language && (
        <div className="card-language">
          <h3>Language</h3>
          <p>{card.language}</p>
        </div>
      )}
    </div>
  );
};

export default PokemonCardDetails;
