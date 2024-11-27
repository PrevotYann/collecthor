import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Select from "react-select";
import ReactCountryFlag from "react-country-flag";
import Switch from "react-switch";
import { useAuth } from "./AuthContext";

import "../styles/cardsearch.css";
import PokemonCard from "./PokemonCard";
import YuGiOhCard from "./YuGiOhCard";
import FFTCGCard from "./FFTCGCard";
import NarutoKayouCard from "./NarutoKayouCard";

const cardTypeOptions = [
  { value: "pokemon", label: "Pokémon" },
  { value: "yugioh", label: "Yu-Gi-Oh!" },
  { value: "fftcg", label: "FF TCG" },
  { value: "narutokayou", label: "Naruto Kayou" },
];

const languageOptions = [
  {
    value: "en",
    label: (
      <span>
        <ReactCountryFlag countryCode="GB" svg /> English
      </span>
    ),
  },
  {
    value: "fr",
    label: (
      <span>
        <ReactCountryFlag countryCode="FR" svg /> Français
      </span>
    ),
  },
  {
    value: "es",
    label: (
      <span>
        <ReactCountryFlag countryCode="ES" svg /> Español
      </span>
    ),
  },
  {
    value: "de",
    label: (
      <span>
        <ReactCountryFlag countryCode="DE" svg /> Deutsch
      </span>
    ),
  },
  {
    value: "it",
    label: (
      <span>
        <ReactCountryFlag countryCode="IT" svg /> Italian
      </span>
    ),
  },
  {
    value: "pt",
    label: (
      <span>
        <ReactCountryFlag countryCode="PT" svg /> Portuguese
      </span>
    ),
  },
  {
    value: "jp",
    label: (
      <span>
        <ReactCountryFlag countryCode="JP" svg /> Japanese
      </span>
    ),
  },
  {
    value: "ko",
    label: (
      <span>
        <ReactCountryFlag countryCode="KR" svg /> Korean
      </span>
    ),
  },
  {
    value: "zh-CN",
    label: (
      <span>
        <ReactCountryFlag countryCode="CN" svg /> Chinese
      </span>
    ),
  },
  {
    value: "zh-TW",
    label: (
      <span>
        <ReactCountryFlag countryCode="TW" svg /> Taiwan
      </span>
    ),
  },
];

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

const CardSearchComponent = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [cardType, setCardType] = useState(cardTypeOptions[0]);
  const [cards, setCards] = useState([]);
  const [language, setLanguage] = useState(null);
  const [displayedCards, setDisplayedCards] = useState([]);
  const [currentCount, setCurrentCount] = useState(20);
  const [showImages, setShowImages] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [collection, setCollection] = useState(false);
  const aggregatedCollection = aggregateQuantities(collection);
  const fetchCollection = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/items/user/${user.username}`
      );
      setCollection(response.data || []);
    } catch (error) {
      console.error("Failed to fetch collection:", error);
    }
  }, [user?.username]);

  useEffect(() => {
    if (user?.username) {
      fetchCollection();
    }
  }, [user, fetchCollection]);

  useEffect(() => {
    const filteredCards = cards.filter((card) => {
      const cardLanguage = card.language || card.lang || null; // Use card.language if it exists; otherwise, fallback to card.lang
      return !language || cardLanguage === language.value;
    });
    setDisplayedCards(filteredCards.slice(0, currentCount));
  }, [cards, language, currentCount]);

  const handleSearch = async () => {
    setIsLoading(true);
    const baseURLs = {
      pokemon: `${process.env.REACT_APP_API_URL}/cards/pokemon/search?query=`,
      yugioh: `${process.env.REACT_APP_API_URL}/cards/yugioh/search?query=`,
      fftcg: `${process.env.REACT_APP_API_URL}/cards/fftcg/search?query=`,
      narutokayou: `${process.env.REACT_APP_API_URL}/cards/naruto-kayou/search?query=`,
    };

    const url = `${baseURLs[cardType.value]}${encodeURIComponent(query)}`;

    try {
      const response = await axios.get(url);
      setCards(response.data);
      setIsLoading(false);
      setCurrentCount(20);
    } catch (error) {
      console.error("Error fetching data:", error);
      setCards([]);
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    setCurrentCount(currentCount + 20);
  };

  const handleSelectChange = (selectedOption) => {
    setCards([]);
    setDisplayedCards([]);
    setQuery("");
    setCardType(selectedOption);
  };

  const handleLanguageChange = (selectedOption) => {
    setLanguage(selectedOption);
  };

  const renderCard = (card) => {
    const cardInCollection = aggregatedCollection.find(
      (item) => item.specific_id === card.id
    );

    const cardDetails = (
      <div
        className={`card-details ${cardInCollection ? "in-collection" : ""}`}
        key={card.id}
      >
        <p>
          <b>{card.name}</b>
        </p>
        <p>
          {cardType.value === "pokemon"
            ? `Set Number: ${card.local_id}`
            : cardType.value === "yugioh"
            ? `Set Number: ${card.set_number}`
            : `Set Number: ${card.code}`}
        </p>
        <p>Rarity: {card.rarity}</p>
        <p>Language: {card.language ? card.language : card.lang}</p>
        {cardInCollection && (
          <div className="quantity-badge">
            {cardInCollection.user_item_details.quantity}
          </div>
        )}
      </div>
    );

    if (showImages) {
      // This is the image view
      if (cardType.value === "pokemon") {
        return (
          <PokemonCard
            card={card}
            key={card.id}
            collection={collection}
            setCollection={setCollection}
            displayBox={false}
          />
        );
      } else if (cardType.value === "yugioh") {
        return (
          <YuGiOhCard
            card={card}
            key={card.id}
            collection={collection}
            setCollection={setCollection}
            displayBox={false}
          />
        );
      } else if (cardType.value === "fftcg") {
        return (
          <FFTCGCard
            card={card}
            key={card.id}
            collection={collection}
            setCollection={setCollection}
            displayBox={false}
          />
        );
      } else {
        return (
          <NarutoKayouCard
            card={card}
            key={card.id}
            collection={collection}
            setCollection={setCollection}
            displayBox={false}
          />
        );
      }
    } else {
      // This is the list/no-image view
      return cardDetails;
    }
  };

  return (
    <div className="search-container">
      <div className="search-bar">
        <Select
          options={cardTypeOptions}
          value={cardType}
          onChange={handleSelectChange}
          className="select-dropdown"
        />
        <Select
          options={languageOptions}
          value={language}
          onChange={handleLanguageChange}
          className="select-dropdown"
          isClearable
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search cards..."
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
        <label style={{ display: "contents" }}>
          Show Images
          <Switch
            onChange={setShowImages}
            checked={showImages}
            offColor="#888"
            onColor="#0f0"
          />
        </label>
      </div>
      {isLoading ? (
        <div className="loader-container">
          <div className="inner-loader-container">
            <div className="loader"></div>
            <div className="loader-text">Searching for results...</div>
          </div>
        </div>
      ) : (
        <div className={showImages ? "cards-display" : ""}>
          {displayedCards.map(renderCard)}
        </div>
      )}
      {!isLoading && displayedCards.length < cards.length && (
        <button onClick={handleLoadMore} className="load-more-button">
          Load More
        </button>
      )}
    </div>
  );
};

export default CardSearchComponent;
