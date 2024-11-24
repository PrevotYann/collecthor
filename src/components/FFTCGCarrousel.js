import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CardsCarrousel.css"; // Same CSS file, since the styles are reusable

const FFTCGCarrousel = ({ limit }) => {
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
          `${process.env.REACT_APP_API_URL}/cards/fftcg/random/${limit}`
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
    navigate(`/fftcg/card-details`, { state: { card } });
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
  const fallbackImageUrl = "/pokemon_back_card.webp"; // Fallback image URL for errors

  return (
    <div className="carousel-card" onClick={onClick}>
      <img
        src={card.full_image ? card.full_image : fallbackImageUrl}
        alt={card.name}
        className="carousel-image"
      />
      <p
        className="carousel-title"
        dangerouslySetInnerHTML={{ __html: card.name }}
      ></p>
    </div>
  );
};

export default FFTCGCarrousel;
