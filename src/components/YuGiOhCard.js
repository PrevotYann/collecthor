import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

import "../styles/YuGiOhCard.css"; // Path to CSS file

const YuGiOhCard = ({ card }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState("");
  const [isFirstEdition, setIsFirstEdition] = useState(false);
  const [extras, setExtras] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const images = JSON.parse(card.images);
  const fallbackImageUrl = "/yugioh_back_card.webp";
  const { user } = useAuth();

  useEffect(() => {
    const fetchImageUrl = async (fileName) => {
      const apiURL = process.env.REACT_APP_MEDIAWIKI_API_URL;
      try {
        const response = await fetch(
          `${apiURL}?action=query&format=json&prop=imageinfo&titles=File:${encodeURIComponent(
            fileName
          )}&iiprop=url`,
          {
            method: "GET",
          }
        );
        const data = await response.json();
        const pages = data.query.pages;
        const page = pages[Object.keys(pages)[0]];
        if (page.imageinfo) {
          setImageUrl(page.imageinfo[0].url);
        } else {
          setImageUrl(fallbackImageUrl);
        }
      } catch (error) {
        console.error("Failed to fetch image URL:", error);
        setImageUrl(fallbackImageUrl);
      }
    };

    if (images && images[0]) {
      fetchImageUrl(images[0]);
    } else {
      setImageUrl(fallbackImageUrl);
    }
  }, [images]);

  const handleAddToCollection = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/items/table/cards_yugioh/item/${card.id}/user/${user.username}`,
        { quantity, condition, extras, is_first_edition: isFirstEdition }
      );
      alert("Card added to collection!");
      setShowAddForm(false);
    } catch (error) {
      alert("Failed to add card to collection.");
      console.error(error);
    }
  };

  return (
    <div className="yugioh-card-container">
      <div className="yugioh-card-image">
        <img src={imageUrl || fallbackImageUrl} alt={card.name} />
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
      </div>
    </div>
  );
};

export default YuGiOhCard;
