import React, { useState, useEffect } from "react";
import axios from "axios";
import PokemonCard from "./PokemonCard"; // Import the card component
import { useAuth } from "./AuthContext";

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

const PorkemonCardsetsBrowser = () => {
  const { user } = useAuth();
  const [collection, setCollection] = useState([]);
  const [cardsets, setCardsets] = useState([]);
  const [filteredCardsets, setFilteredCardsets] = useState([]);
  const [language, setLanguage] = useState("");
  const [searchName, setSearchName] = useState("");
  const [selectedCards, setSelectedCards] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage] = useState(10);
  // Define fetchCollection outside of useEffect
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

  // Initial fetch on component mount
  useEffect(() => {
    if (user && user.username) {
      fetchCollection();
    }
  }, [user]); // Dependency on user object

  useEffect(() => {
    fetchCardsets();
  }, []);

  const fetchCardsets = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/cardsets/pokemon/all`
      );
      setCardsets(response.data);
      setFilteredCardsets(response.data); // Initially, no filter applied
    } catch (error) {
      console.error("Failed to fetch cardsets:", error);
    }
  };

  useEffect(() => {
    const result = cardsets.filter(
      (cardset) =>
        (language ? cardset.language === language : true) &&
        cardset.name.toLowerCase().includes(searchName.toLowerCase())
    );
    setFilteredCardsets(result);
  }, [language, searchName, cardsets]);

  const handleSelectCardset = async (id) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/cardsets/pokemon/id/${id}/cards`
      );
      setSelectedCards(response.data);
    } catch (error) {
      console.error("Failed to fetch cards:", error);
    }
  };

  const indexOfLastCardset = currentPage * cardsPerPage;
  const indexOfFirstCardset = indexOfLastCardset - cardsPerPage;
  const currentCardsets = filteredCardsets.slice(
    indexOfFirstCardset,
    indexOfLastCardset
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <FormControl fullWidth>
        <InputLabel id="language-label">Language</InputLabel>
        <Select
          labelId="language-label"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {[
            "fr",
            "en",
            "ko",
            "ja",
            "es",
            "it",
            "pt",
            "de",
            "zh-CN",
            "zh-TW",
          ].map((lang) => (
            <MenuItem key={lang} value={lang}>
              {lang.toUpperCase()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        label="Search by Name"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
      />

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Language</TableCell>
            <TableCell>Set number</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentCardsets.map((cardset) => (
            <TableRow
              key={cardset.id}
              hover
              onClick={() => handleSelectCardset(cardset.id)}
            >
              <TableCell>{cardset.name}</TableCell>
              <TableCell>{cardset.language}</TableCell>
              <TableCell>{cardset.local_id}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <Button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage * cardsPerPage >= filteredCardsets.length}
      >
        Next
      </Button>

      {selectedCards.length > 0 && (
        <div>
          <h2>Selected Cardset Cards</h2>
          {selectedCards.map((card) => (
            <PokemonCard
              key={card.id}
              card={card}
              collection={collection}
              setCollection={setCollection}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PorkemonCardsetsBrowser;
