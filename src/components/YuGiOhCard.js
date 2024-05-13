import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

import "../styles/YuGiOhCard.css";

const aggregateQuantities = (collection) => {
  return collection?.reduce((acc, item) => {
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
    }/items/table/cards_yugioh/item/${
      card.id
    }/condition/${condition}/first/${true}/ebay/price`;
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
    }/items/table/cards_yugioh/item/${
      card.id
    }/condition/${condition}/first/${false}/ebay/price`;
    const response2 = await axios.post(url2);
    try {
      if (response2.data) {
        toast.success(
          `Price updated (${condition} | Median: ${response.data.median}, High: ${response.data.high}, Low: ${response.data.low}`
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

const YuGiOhCard = ({ card, collection, setCollection }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState("near_mint");
  const [isFirstEdition, setIsFirstEdition] = useState(false);
  const [extras, setExtras] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [priceData, setPriceData] = useState([]);
  const [viewPrices, setViewPrices] = useState(false);
  const { user } = useAuth();
  const aggregatedCollection = aggregateQuantities(collection);

  const cardInCollection = aggregatedCollection.find(
    (item) => item.specific_id === card.id
  );

  const fetchCollection = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/items/user/${user.username}`
      );
      setCollection(aggregateQuantities(response.data)); // Assuming you are using aggregation function
    } catch (error) {
      console.error("Failed to fetch collection:", error);
    }
  };

  const fetchPriceData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/items/table/${card.table_name}/item/${card.id}/ebay/prices/all`
      );
      setPriceData(response.data);
    } catch (error) {
      console.error("Failed to fetch price data:", error);
      toast.error("Failed to fetch price data.");
    }
  };

  useEffect(() => {
    const fetchImageUrl = async () => {
      if (!card.images) return setImageUrl("/yugioh_back_card.webp");

      const images = JSON.parse(card.images);
      const apiURL = process.env.REACT_APP_MEDIAWIKI_API_URL;
      try {
        const response = await fetch(
          `${apiURL}?action=query&format=json&prop=imageinfo&titles=File:${encodeURIComponent(
            images[0]
          )}&iiprop=url`,
          { method: "GET" }
        );
        const data = await response.json();
        const page = data.query.pages[Object.keys(data.query.pages)[0]];
        setImageUrl(
          page.imageinfo ? page.imageinfo[0].url : "/yugioh_back_card.webp"
        );
      } catch (error) {
        console.error("Failed to fetch image URL:", error);
        setImageUrl("/yugioh_back_card.webp");
      }
    };

    fetchImageUrl();
  }, [card.images]);

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/items/table/cards_yugioh/item/${card.id}/ebay/prices/all`
        );
        setPriceData(response.data);
      } catch (error) {
        console.error("Failed to fetch price data:", error);
      }
    };

    fetchPriceData();
  }, [card.id]);

  const handleAddToCollection = async () => {
    const newCard = {
      specific_id: card.id,
      user_item_details: {
        quantity,
        condition,
        is_first_edition: isFirstEdition,
      },
    };

    // Optimistically update the UI
    const newCollection = [...collection, newCard];
    setCollection(aggregateQuantities(newCollection));

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/items/table/cards_yugioh/item/${card.id}/user/${user.username}`,
        { quantity, condition, extras, is_first_edition: isFirstEdition }
      );
      toast.success("Card added to collection!");
      setShowAddForm(false);
    } catch (error) {
      toast.error("Failed to add card to collection.");
      console.error(error);
      // Revert to original collection if the update fails
      fetchCollection();
    }
  };

  return (
    <div
      className={`yugioh-card-container ${
        cardInCollection ? "in-collection" : ""
      }`}
    >
      <div className="yugioh-card-image">
        <img src={imageUrl} alt={card.name} />
        {cardInCollection && (
          <div className="quantity-button">
            {cardInCollection.user_item_details.quantity}
          </div>
        )}
      </div>
      <div className="yugioh-card-details">
        <h2>{card.name}</h2>
        <p>
          <strong>Language:</strong> {card.language}
        </p>
        <p>
          <strong>Set number:</strong> {card.set_number}
        </p>
        <p>
          <strong>Rarity:</strong> {card.rarity}
        </p>
        <div style={{ display: "flex", gap: "16px" }}>
          {user && !showAddForm && (
            <button className="add-button" onClick={() => setShowAddForm(true)}>
              Add to Collection
            </button>
          )}
          <button className="price-button" onClick={() => updatePrices(card)}>
            Update Price
          </button>
          <button
            className="view-prices-button"
            onClick={() => setViewPrices(!viewPrices)}
          >
            View Prices
          </button>
        </div>
        {user && showAddForm && (
          <div className="add-form">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              placeholder="Quantity"
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
            <div className="checkbox-container">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isFirstEdition}
                  onChange={(e) => setIsFirstEdition(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              First Edition
            </div>
            <input
              type="text"
              value={extras}
              placeholder="Extras"
              onChange={(e) => setExtras(e.target.value)}
            />
            <button onClick={handleAddToCollection}>Add</button>
            <button onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        )}
        {viewPrices && priceData.length > 0 ? (
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

export default YuGiOhCard;
