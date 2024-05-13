import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext"; // Ensure the import path is correct
import { toast } from "react-toastify";

import "../styles/PokemonCard.css"; // Path to CSS file

const aggregateQuantities = (collection) => {
  return collection.reduce((acc, item) => {
    const existing = acc.find(
      (entry) => entry.specific_id === item.specific_id
    );
    if (existing) {
      existing.user_item_details.quantity += item.user_item_details?.quantity;
    } else {
      acc.push({
        ...item,
        user_item_details: {
          ...item.user_item_details,
          quantity: item.user_item_details.quantity,
        },
      });
    }
    return acc;
  }, []);
};

const PokemonCard = ({ card, collection, setCollection }) => {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState("near_mint");
  const [isFirstEdition, setIsFirstEdition] = useState(false);
  const [extras, setExtras] = useState("");
  const aggregatedCollection = aggregateQuantities(collection);

  const cardInCollection = aggregatedCollection.find(
    (item) => item.specific_id === card.id
  );

  // Fallback image URL
  const fallbackImageUrl = "/pokemon_back_card.webp";

  const handleAddToCollection = async () => {
    // Create a copy of the new card data for optimistic update
    const newCardData = {
      specific_id: card.id,
      user_item_details: {
        quantity,
        condition,
        extras,
        is_first_edition: isFirstEdition,
      },
      source_item_details: { ...card }, // Assuming the card object has source details
    };

    // Optimistically update the collection in the UI
    const optimisticCollection = [...collection, newCardData];
    setCollection(aggregateQuantities(optimisticCollection));

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
      toast.success("Card added to collection!");
      setShowAddForm(false);
    } catch (error) {
      toast.error("Failed to add card to collection.");
      console.error(error);
      // Revert the collection to its previous state if the API call fails
      setCollection(aggregateQuantities(collection));
    }
  };

  return (
    <div
      className={`pokemon-card-container ${
        cardInCollection ? "in-collection" : ""
      }`}
    >
      <div className="pokemon-card-image">
        <img
          src={
            card.image !== null
              ? card.image + process.env.REACT_APP_POKEMON_IMAGE_SUFFIX
              : fallbackImageUrl
          }
          alt={card.name}
        />
        {cardInCollection && (
          <div className="quantity-button">
            {cardInCollection.user_item_details.quantity}
          </div>
        )}
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
