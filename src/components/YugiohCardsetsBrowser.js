import React, { useState, useEffect } from "react";
import axios from "axios";
import YuGiOhCard from "./YuGiOhCard"; // Import the card component
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { toast } from "react-toastify";

import "../styles/CardsetsBrowsers.css";

const YugiohCardsetsBrowser = () => {
  const { user } = useAuth();
  const [collection, setCollection] = useState([]);
  const [cardsets, setCardsets] = useState([]);
  const [filteredCardsets, setFilteredCardsets] = useState([]);
  const [language, setLanguage] = useState("");
  const [searchName, setSearchName] = useState("");
  const [selectedCards, setSelectedCards] = useState([]);
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState("near_mint");
  const [extras, setExtras] = useState("");
  const [isFirstEdition, setIsFirstEdition] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [cardsetName, setCardsetName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage] = useState(10);
  const [showCardsets, setShowCardsets] = useState(true);

  const toggleCardsetsVisibility = () => {
    setShowCardsets(!showCardsets);
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Dependency on user object

  useEffect(() => {
    fetchCardsets();
  }, []);

  const fetchCardsets = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/cardsets/yugioh/all`
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

  const handleSelectCardset = async (id, name) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/cardsets/yugioh/id/${id}/cards`
      );
      setSelectedCards(
        response.data.sort((a, b) => a.set_number.localeCompare(b.set_number))
      );
      setCardsetName(name);
      toggleCardsetsVisibility();
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

  const handleBulkAdd = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/items/table/cards_yugioh/items/user/${user.username}`,
        {
          item_ids: selectedCardIds,
          quantity,
          condition,
          extras,
          is_first_edition: isFirstEdition,
        }
      );
      toast.success("Cards added to collection!");
      fetchCollection();
      setShowAddPopup(false);
    } catch (error) {
      toast.error("Failed to add cards to collection.");
      console.error(error);
    }
  };

  const cardCount = selectedCards?.reduce((acc, card) => {
    const inCollection = collection.find((c) => c.specific_id === card.id);
    return inCollection ? acc + 1 : acc;
  }, 0);

  return (
    <div>
      <div
        style={{
          maxHeight: showCardsets ? "100%" : "0",
          overflow: "hidden",
          transition: "max-height 0.5s ease-in-out",
        }}
      >
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
              <TableCell>Prefix</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentCardsets.map((cardset) => (
              <TableRow
                key={cardset.id}
                hover
                onClick={() => handleSelectCardset(cardset.id, cardset.name)}
                className="tableRowHover"
              >
                <TableCell>{cardset.name}</TableCell>
                <TableCell>{cardset.language}</TableCell>
                <TableCell>{cardset.prefix}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {showCardsets ? (
        <Button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
      ) : (
        <></>
      )}
      {showCardsets ? (
        <Button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage * cardsPerPage >= filteredCardsets.length}
        >
          Next
        </Button>
      ) : (
        <></>
      )}
      <Button onClick={toggleCardsetsVisibility}>
        {showCardsets ? "Hide Cardsets" : "Show Cardsets"}
      </Button>

      {selectedCards.length > 0 && (
        <div>
          <h2>
            {cardsetName} : {cardCount}/{selectedCards.length}
          </h2>
          {selectedCardIds && selectedCardIds.length > 0 ? (
            <Button onClick={() => setShowAddPopup(true)}>Bulk Add</Button>
          ) : (
            ""
          )}

          <Dialog open={showAddPopup} onClose={() => setShowAddPopup(false)}>
            <DialogTitle
              style={{
                textAlign: "center",
                backgroundColor: "#f0f0f0",
                marginBottom: "16px",
              }}
            >
              Bulk Add Cards
            </DialogTitle>
            <DialogContent>
              <TextField
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                placeholder="Quantity"
                fullWidth
                style={{ marginBottom: "16px" }}
              />
              <FormControl fullWidth style={{ marginBottom: "16px" }}>
                <InputLabel>Condition</InputLabel>
                <Select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="">Select Condition</MenuItem>
                  <MenuItem value="poor">Poor</MenuItem>
                  <MenuItem value="played">Played</MenuItem>
                  <MenuItem value="light_played">Light Played</MenuItem>
                  <MenuItem value="good">Good</MenuItem>
                  <MenuItem value="excellent">Excellent</MenuItem>
                  <MenuItem value="near_mint">Near Mint</MenuItem>
                  <MenuItem value="mint">Mint</MenuItem>
                </Select>
              </FormControl>
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
              <TextField
                type="text"
                value={extras}
                placeholder="Extras"
                onChange={(e) => setExtras(e.target.value)}
                fullWidth
                style={{ marginTop: "16px" }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleBulkAdd}>Add</Button>
              <Button onClick={() => setShowAddPopup(false)}>Cancel</Button>
            </DialogActions>
          </Dialog>
          {selectedCards.map((card) => (
            <YuGiOhCard
              key={card.id}
              card={card}
              collection={collection}
              setCollection={setCollection}
              selectedCardIds={selectedCardIds}
              setSelectedCardIds={setSelectedCardIds}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default YugiohCardsetsBrowser;
