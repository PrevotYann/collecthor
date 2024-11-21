import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

import "../styles/YuGiOhCard.css";

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
    for (let firstEdition of [true, false]) {
      const url = `${
        process.env.REACT_APP_API_URL
      }/items/table/cards_yugioh/item/${
        card.id
      }/condition/${condition}/first/${firstEdition}/extras/${null}/ebay/sold_prices`;

      try {
        const response = await axios.post(url);
        if (response.data) {
          toast.success(
            `Price updated (${condition} ${
              firstEdition ? "1st" : ""
            } | Median: ${response.data.median_price}, High: ${
              response.data.highest_price
            }, Low: ${response.data.lowest_price})`
          );
        } else {
          toast.info(`No new pricing information for ${condition}.`);
        }
      } catch (error) {
        toast.error(`Failed to update price for ${condition}.`);
        console.error("Price update error:", error);
      }
    }
  }
};

const YuGiOhCard = ({
  card,
  collection,
  setCollection,
  selectedCardIds,
  setSelectedCardIds,
}) => {
  const { user } = useAuth();
  const [imageUrl, setImageUrl] = useState("/yugioh_back_card.webp");
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState("near_mint");
  const [isFirstEdition, setIsFirstEdition] = useState(false);
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

  const fetchImageUrl = async () => {
    if (!card.images) return;
    const images = JSON.parse(card.images);
    const apiURL = process.env.REACT_APP_MEDIAWIKI_API_URL;

    try {
      const response = await fetch(
        `${apiURL}?action=query&format=json&prop=imageinfo&titles=File:${encodeURIComponent(
          images[0]
        )}&iiprop=url`
      );
      const data = await response.json();
      const page = data.query.pages[Object.keys(data.query.pages)[0]];
      setImageUrl(
        page.imageinfo ? page.imageinfo[0].url : "/yugioh_back_card.webp"
      );
    } catch (error) {
      console.error("Failed to fetch image URL:", error);
    }
  };

  useEffect(() => {
    fetchImageUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.images]);

  const fetchPriceData = async () => {
    setLoadingPrices(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/items/table/cards_yugioh/item/${card.id}/ebay/prices/all`
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

  const handleAddToCollection = async () => {
    const newCard = {
      specific_id: card.id,
      user_item_details: {
        quantity,
        condition,
        extras,
        is_first_edition: isFirstEdition,
      },
      source_item_details: { ...card },
    };

    // Optimistically update the UI
    const updatedCollection = [...collection, newCard];
    setCollection(aggregateQuantities(updatedCollection));

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/items/table/cards_yugioh/item/${card.id}/user/${user.username}`,
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
      className={`yugioh-card-container ${
        cardInCollection ? "in-collection" : ""
      }`}
    >
      <div className="select-checkbox">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
        />
      </div>
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
                <p>
                  {price.condition} {price.is_first_edition ? "(1st)" : ""}
                </p>
                <p>Lowest: ${price.ebay_lowest}</p>
                <p>Median: ${price.ebay_median}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default YuGiOhCard;
