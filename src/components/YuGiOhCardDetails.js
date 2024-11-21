import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/YuGiOhCardDetails.css";

const YuGiOhCardDetails = () => {
  const location = useLocation();
  const { card } = location.state; // Card details passed through navigation
  const [imageUrl, setImageUrl] = useState("/yugioh_back_card.webp");

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
  }, [card]);

  return (
    <div className="card-details">
      <div className="card-image">
        <img src={imageUrl} alt={card.name} />
      </div>
      <div className="card-info">
        <h1>{card.name}</h1>
        <p>
          <strong>Element:</strong> {card.attribute || "N/A"}
        </p>
        <p>
          <strong>Type:</strong> {card.card_type}
        </p>
        <p>
          <strong>Monster Type:</strong> {card.monster_type_line || "N/A"}
        </p>
        <p>
          <strong>Rarity:</strong> {card.rarity}
        </p>
        <p>
          <strong>Level:</strong> {card.level || "N/A"}
        </p>
        <p>
          <strong>Description:</strong> {card.text}
        </p>
        <p>
          <strong>Attack:</strong> {card.atk || "N/A"}
        </p>
        <p>
          <strong>Defense:</strong> {card.def_ || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default YuGiOhCardDetails;
