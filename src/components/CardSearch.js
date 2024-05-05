import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import ReactCountryFlag from "react-country-flag";

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
  const [query, setQuery] = useState("");
  const [cardType, setCardType] = useState(cardTypeOptions[0]);
  const [cards, setCards] = useState([]);
  const [language, setLanguage] = useState(null);
  const [filteredCards, setFilteredCards] = useState([]); // to store filtered results
  const [displayedCards, setDisplayedCards] = useState([]);
  const [currentCount, setCurrentCount] = useState(20);

  useEffect(() => {
    const filtered = cards.filter(
      (card) => !language || card.language === language.value
    );
    setFilteredCards(filtered);
    setDisplayedCards(filtered.slice(0, currentCount));
  }, [cards, language, currentCount]);

  const handleSearch = async () => {
    const baseURLs = {
      pokemon: `${process.env.REACT_APP_API_URL}/cards/pokemon/search?query=`,
      yugioh: `${process.env.REACT_APP_API_URL}/cards/yugioh/search?query=`,
    };

    const url = `${baseURLs[cardType.value]}${encodeURIComponent(query)}`;

    try {
      const response = await axios.get(url);
      setCards(response.data);
      setCurrentCount(20); // Reset the count on a new search
    } catch (error) {
      console.error("Error fetching data:", error);
      setCards([]);
      setFilteredCards([]);
      setDisplayedCards([]);
    }
  };

  const handleLoadMore = () => {
    setCurrentCount(currentCount + 20);
  };

  const handleSelectChange = (selectedOption) => {
    setCardType(selectedOption);
    setCards([]);
    setQuery("");
    setFilteredCards([]);
    setDisplayedCards([]);
  };

  const handleLanguageChange = (selectedOption) => {
    setLanguage(selectedOption);
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
      </div>
      <div className="cards-display">
        {displayedCards.map((card) =>
          cardType.value === "pokemon" ? (
            <PokemonCard card={card} key={card.id} />
          ) : (
            <YuGiOhCard card={card} key={card.id} />
          )
        )}
      </div>
      {filteredCards.length > displayedCards.length && (
        <button onClick={handleLoadMore} className="load-more-button">
          Load More
        </button>
      )}
    </div>
  );
};

export default CardSearchComponent;
