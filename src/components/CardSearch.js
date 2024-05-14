import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import ReactCountryFlag from "react-country-flag";
import Switch from "react-switch";
import { useAuth } from "./AuthContext";

import "../styles/cardsearch.css";
import PokemonCard from "./PokemonCard";
import YuGiOhCard from "./YuGiOhCard";

const cardTypeOptions = [
  { value: "pokemon", label: "Pokémon" },
  { value: "yugioh", label: "Yu-Gi-Oh!" },
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
    const fetchCollection = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/items/user/${user.username}`
        );
        setCollection(response.data || []);
      } catch (error) {
        console.error("Failed to fetch collection:", error);
      }
    };

  useEffect(() => {
    if (user && user.username) {
      fetchCollection();
    }
  }, [user]);

  useEffect(() => {
    const filteredCards = cards.filter(
      (card) => !language || card.language === language.value
    );
    setDisplayedCards(filteredCards.slice(0, currentCount));
  }, [cards, language, currentCount]);

  const handleSearch = async () => {
    setIsLoading(true);
    const baseURLs = {
      pokemon: `${process.env.REACT_APP_API_URL}/cards/pokemon/search?query=`,
      yugioh: `${process.env.REACT_APP_API_URL}/cards/yugioh/search?query=`,
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
    if (showImages) {
      return cardType.value === "pokemon" ? (
        <PokemonCard card={card} key={card.id} setCollection={setCollection}/>
      ) : (
        <YuGiOhCard card={card} key={card.id} setCollection={setCollection}/>
      );
    } else {
      return (
        <div className="card-details" key={card.id}>
          <p>
            <b>{card.name}</b>
          </p>
          <p>
            {cardType.value === "pokemon"
              ? `Set Number: ${card.local_id}`
              : `Set Number: ${card.set_number}`}
          </p>
          <p>Rarity: {card.rarity}</p>
          <p>Language: {card.language}</p>
        </div>
      );
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
