import React, { useEffect, useState } from "react";
import "../styles/YuGiOhCard.css"; // Path to CSS file

const YuGiOhCard = ({ card }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const images = JSON.parse(card.images);
  const fallbackImageUrl = "/yugioh_back_card.webp";

  useEffect(() => {
    const fetchImageUrl = async (fileName) => {
      const apiURL = process.env.REACT_APP_MEDIAWIKI_API_URL; // Make sure to set this in your environment variables

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
  }, [images]); // Dependency array, re-run if images changes

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
          <strong>Type:</strong> {card.monster_type_line}
        </p>
        <p>
          <strong>Rarity:</strong> {card.rarity}
        </p>
      </div>
    </div>
  );
};

export default YuGiOhCard;
