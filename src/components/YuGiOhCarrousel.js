import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/YuGiOhCarrousel.css";

const YuGiOhCarrousel = ({ limit }) => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(1);
  const imageCache = useRef(new Map()); // Persistent cache for images
  const navigate = useNavigate();

  // Fetch random cards from the API
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/cards/yugioh/random/${limit}`
        );
        const data = await response.json();
        setCards(data);
      } catch (error) {
        console.error("Error fetching cards:", error);
      }
    };

    fetchCards();
  }, [limit]);

  // Adjust visible cards based on screen width
  useEffect(() => {
    const updateVisibleCards = () => {
      const width = window.innerWidth;
      if (width > 1200) setVisibleCards(6);
      else if (width > 992) setVisibleCards(4);
      else if (width > 768) setVisibleCards(3);
      else if (width > 576) setVisibleCards(2);
      else setVisibleCards(1);
    };

    updateVisibleCards();
    window.addEventListener("resize", updateVisibleCards);
    return () => window.removeEventListener("resize", updateVisibleCards);
  }, []);

  // Handle navigation
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + 1;
      return newIndex >= Math.ceil(cards.length / visibleCards) ? 0 : newIndex;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex - 1;
      return newIndex < 0
        ? Math.ceil(cards.length / visibleCards) - 1
        : newIndex;
    });
  };

  const handleCardClick = (card) => {
    navigate(`/yugioh/card-details`, { state: { card } });
  };

  return (
    <div className="carousel-container">
      <button className="carousel-arrow left" onClick={prevSlide}>
        &#10094;
      </button>

      <div className="carousel-wrapper">
        <div
          className="carousel-slides"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            gridTemplateColumns: `repeat(${cards.length}, ${
              100 / visibleCards
            }%)`,
          }}
        >
          {cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card)}
              imageCache={imageCache}
            />
          ))}
        </div>
      </div>

      <button className="carousel-arrow right" onClick={nextSlide}>
        &#10095;
      </button>

      <div className="carousel-dots">
        {Array(Math.ceil(cards.length / visibleCards))
          .fill(0)
          .map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
            ></span>
          ))}
      </div>
    </div>
  );
};

const CardItem = ({ card, onClick, imageCache }) => {
  const [imageUrl, setImageUrl] = useState("/yugioh_back_card.webp");

  useEffect(() => {
    const fetchImageUrl = async () => {
      if (!card.images) return;
      const images = JSON.parse(card.images);
      const apiURL = process.env.REACT_APP_MEDIAWIKI_API_URL;

      // Check cache first
      if (imageCache.current.has(images[0])) {
        setImageUrl(imageCache.current.get(images[0]));
        return;
      }

      try {
        const response = await fetch(
          `${apiURL}?action=query&format=json&prop=imageinfo&titles=File:${encodeURIComponent(
            images[0]
          )}&iiprop=url`
        );
        const data = await response.json();
        const page = data.query.pages[Object.keys(data.query.pages)[0]];
        const url = page.imageinfo
          ? page.imageinfo[0].url
          : "/yugioh_back_card.webp";

        imageCache.current.set(images[0], url); // Cache the URL
        setImageUrl(url);
      } catch (error) {
        console.error("Failed to fetch image URL:", error);
      }
    };

    fetchImageUrl();
  }, [card, imageCache]);

  return (
    <div className="carousel-card" onClick={onClick}>
      <img src={imageUrl} alt={card.name} className="carousel-image" />
      <p
        className="carousel-title"
        dangerouslySetInnerHTML={{ __html: card.name }}
      ></p>
    </div>
  );
};

export default YuGiOhCarrousel;
