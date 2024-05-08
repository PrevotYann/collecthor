import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext"; // Ensure the import path is correct

import "../styles/PokemonCard.css"; // Path to CSS file

const PokemonCard = ({ card }) => {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState("");
  const [isFirstEdition, setIsFirstEdition] = useState(false);
  const [extras, setExtras] = useState("");

  // Fallback image URL
  const fallbackImageUrl = "/pokemon_back_card.webp";

  const handleAddToCollection = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/items/table/cards_pokemon/item/${card.id}/user/${user.username}`,
        {
          quantity,
          condition,
          extras,
          is_first_edition: isFirstEdition,
        }
      );
      alert("Card added to collection!");
      setShowAddForm(false);
    } catch (error) {
      alert("Failed to add card to collection.");
      console.error(error);
    }
  };

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
          <strong>Set number:</strong> {card.local_id}
        </p>
        {user && !showAddForm && (
          <button className="add-button" onClick={() => setShowAddForm(true)}>
            Add to Collection
          </button>
        )}
        {user && showAddForm && (
          <div className="add-form">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
            />
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="">Select Condition</option>
              <option value="poor">Poor</option>
              <option value="played">Played</option>
              <option value="light_played">Light Played</option>
              <option value="good">Good</option>
              <option value="excellent">Excellent</option>
              <option value="near_mint">Near Mint</option>
              <option value="mint">Mint</option>
            </select>
            <label>
              First Edition
              <input
                type="checkbox"
                checked={isFirstEdition}
                onChange={(e) => setIsFirstEdition(e.target.checked)}
              />
            </label>
            <input
              type="text"
              value={extras}
              placeholder="Extras"
              onChange={(e) => setExtras(e.target.value)}
            />
            <button onClick={handleAddToCollection}>Submit</button>
            <button onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PokemonCard;
