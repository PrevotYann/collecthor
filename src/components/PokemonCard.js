import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext"; // Ensure the import path is correct
import { toast } from "react-toastify";

import "../styles/PokemonCard.css"; // Path to CSS file

const aggregateQuantities = (collection) => {
  if (!Array.isArray(collection)) {
    return [];
  }
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

const updatePrices = async (card) => {
  const conditions = [
    "poor",
    "played",
    "light_played",
    "good",
    "excellent",
    "near_mint",
    "mint",
  ];
  for (let condition of conditions) {
    const url = `${
      process.env.REACT_APP_API_URL
    }/items/table/cards_pokemon/item/${
      card.id
    }/condition/${condition}/first/${true}/extras/${null}/ebay/price`;
    const response = await axios.post(url);
    try {
      if (response.data) {
        toast.success(
          `Price updated (${condition} 1st | Median: ${response.data.median}, High: ${response.data.high}, Low: ${response.data.low}`
        );
      } else {
        toast.info("No new pricing information available.");
      }
    } catch (error) {
      toast.error("Failed to update price.");
      console.error("Price update error:", error);
    }

    const url2 = `${
      process.env.REACT_APP_API_URL
    }/items/table/cards_pokemon/item/${
      card.id
    }/condition/${condition}/first/${false}/extras/${null}/ebay/price`;
    const response2 = await axios.post(url2);
    try {
      if (response2.data) {
        toast.success(
          `Price updated (${condition} | Median: ${response2.data.median}, High: ${response2.data.high}, Low: ${response2.data.low}`
        );
      } else {
        toast.info("No new pricing information available.");
      }
    } catch (error) {
      toast.error("Failed to update price.");
      console.error("Price update error:", error);
    }
  }
};

const PokemonCard = ({
  card,
  collection,
  setCollection,
  selectedCardIds,
  setSelectedCardIds,
}) => {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState("near_mint");
  const [isFirstEdition, setIsFirstEdition] = useState(false);
  const [extras, setExtras] = useState("");
  const [priceData, setPriceData] = useState([]);
  const [viewPrices, setViewPrices] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const aggregatedCollection = aggregateQuantities(collection);

  const cardInCollection = aggregatedCollection.find(
    (item) => item.specific_id === card.id
  );

  // Fallback image URL
  const fallbackImageUrl = "/pokemon_back_card.webp";

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/items/table/cards_pokemon/item/${card.id}/ebay/prices/all`
        );
        setPriceData(response.data);
      } catch (error) {
        console.error("Failed to fetch price data:", error);
      }
    };

    fetchPriceData();
  }, [card.id]);

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
      setIsChecked(false);
    } catch (error) {
      toast.error("Failed to add card to collection.");
      console.error(error);
      // Revert the collection to its previous state if the API call fails
      setCollection(aggregateQuantities(collection));
    }
  };

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    if (!isChecked) {
      setSelectedCardIds([...selectedCardIds, card.id]);
    } else {
      setSelectedCardIds(selectedCardIds.filter((id) => id !== card.id));
    }
  };

  return (
    <div
      className={`pokemon-card-container ${
        cardInCollection ? "in-collection" : ""
      }`}
    >
      <div className="select-checkbox">
        <input
          style={{ marginRight: "1rem" }}
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
        />
      </div>
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
        <div style={{ display: "flex", gap: "16px" }}>
          {user && !showAddForm && (
            <button className="add-button" onClick={() => setShowAddForm(true)}>
              Add to Collection
            </button>
          )}
          <button className="price-button" onClick={() => updatePrices(card)}>
            Update Prices
          </button>
          <button
            className="view-prices-button"
            onClick={() => setViewPrices(!viewPrices)}
          >
            {viewPrices ? "Hide Prices" : "View Prices"}
          </button>
        </div>
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
            <select value={extras} onChange={(e) => setExtras(e.target.value)}>
              <option value="">Select extra</option>
              <option value="Reverse">Reverse</option>
              <option value="Holo">Holo</option>
            </select>
            <button onClick={handleAddToCollection}>Submit</button>
            <button onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        )}
        {viewPrices && priceData && priceData.length > 0 ? (
          <div className="price-details">
            {priceData.map((price) => (
              <div key={price.id} className="price-entry">
                <p>
                  {price.condition} {price.is_first_edition ? "(1st)" : ""}
                </p>
                <p>Lowest: ${price.ebay_lowest}</p>
                <p>Median: ${price.ebay_median}</p>
              </div>
            ))}
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default PokemonCard;
