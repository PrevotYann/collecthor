import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

import "../styles/NarutoKayouCard.css";

// Function to aggregate card quantities in the collection
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

// Function to update prices
const updatePrices = async (card) => {
  try {
    const url = `${process.env.REACT_APP_API_URL}/items/table/cards_naruto-kayou/item/${card.id}/ebay/sold_prices`;

    const response = await axios.post(url);
    if (response.data) {
      toast.success(
        `Price updated | Median: ${response.data.median_price}, High: ${response.data.highest_price}, Low: ${response.data.lowest_price}`
      );
    } else {
      toast.info(`No new pricing information available.`);
    }
  } catch (error) {
    toast.error(`Failed to update price.`);
    console.error("Price update error:", error);
  }
};

// The main component for NarutoCardCard
const NarutoKayouCard = ({
  card,
  collection,
  setCollection,
  selectedCardIds,
  setSelectedCardIds,
  displayBox = true,
}) => {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [extras, setExtras] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [priceData, setPriceData] = useState([]);
  const [viewPrices, setViewPrices] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const aggregatedCollection = aggregateQuantities(collection);
  const cardInCollection = aggregatedCollection.find(
    (item) => item.specific_id === card.id
  );

  // Fetch price data from an API
  const fetchPriceData = async () => {
    setLoadingPrices(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/items/table/cards_naruto-kayou/item/${card.id}/ebay/prices/all`
      );
      setPriceData(response.data);
    } catch (error) {
      toast.error("Failed to fetch price data.");
      console.error("Fetch price data error:", error);
    } finally {
      setLoadingPrices(false);
    }
  };

  const toggleViewPrices = () => {
    if (!viewPrices) {
      fetchPriceData();
    }
    setViewPrices(!viewPrices);
  };

  // Handle adding the card to the collection
  const handleAddToCollection = async () => {
    const newCard = {
      specific_id: card.id,
      user_item_details: {
        quantity,
        extras,
      },
      source_item_details: { ...card },
    };

    // Optimistically update the UI
    const updatedCollection = [...collection, newCard];
    setCollection(aggregateQuantities(updatedCollection));

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/items/table/cards_naruto-kayou/item/${card.id}/user/${user.username}`,
        {
          quantity,
          extras,
        }
      );
      toast.success("Card added to collection!");
      setShowAddForm(false);
      setIsChecked(false);
    } catch (error) {
      toast.error("Failed to add card to collection.");
      console.error(error);
    }
  };

  // Handle the checkbox to select cards
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
      className={`naruto-card-container ${
        cardInCollection ? "in-collection" : ""
      }`}
    >
      {displayBox && (
        <div className="select-checkbox">
          <input
            style={{ marginRight: "1rem" }}
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
        </div>
      )}
      <div className="naruto-card-image">
        <img src={card.image || "/naruto_default_card.webp"} alt={card.name} />
        {cardInCollection && (
          <div className="quantity-button">
            {cardInCollection.user_item_details.quantity}
          </div>
        )}
      </div>
      <div className="naruto-card-details">
        <h2>{card.name}</h2>
        <p>
          <strong>Code:</strong> {card.code}
        </p>
        <p>
          <strong>Set:</strong> {card.extension}
        </p>
        <div className="button-container">
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
            onClick={toggleViewPrices}
            disabled={loadingPrices}
          >
            {loadingPrices
              ? "Loading..."
              : viewPrices
              ? "Hide Prices"
              : "View Prices"}
          </button>
        </div>
        {showAddForm && (
          <div className="add-form">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
            />
            <input
              type="text"
              placeholder="Extras"
              value={extras}
              onChange={(e) => setExtras(e.target.value)}
            />
            <button onClick={handleAddToCollection}>Submit</button>
            <button onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        )}
        {viewPrices && priceData.length > 0 && (
          <div className="price-details">
            {priceData.map((price) => (
              <div key={price.id} className="price-entry">
                <p>Price: ${price.ebay_median}</p>
                <p>Highest: ${price.ebay_highest}</p>
                <p>Lowest: ${price.ebay_lowest}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NarutoKayouCard;
