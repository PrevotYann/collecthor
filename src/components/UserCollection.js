import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";
import ReactCountryFlag from "react-country-flag";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import { toast } from "react-toastify";

const cardTypeOptions = [
  { value: "cards_pokemon", label: "Pokémon" },
  { value: "cards_yugioh", label: "Yu-Gi-Oh!" },
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

const UserCardsTable = () => {
  const { user } = useAuth();
  const [collection, setCollection] = useState([]);
  const [sourceTableFilter, setSourceTableFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [searchName, setSearchName] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [isEuroDisplayed, setIsEuroDisplayed] = useState(false);
  const EURO_TO_DOLLAR_RATE = 1.07748;

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

  const handleEditItem = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/items/${editItem.user_item_id}/user/${user.username}`,
        {
          quantity: editItem.quantity,
          condition: editItem.condition,
          extras: editItem.extras,
          is_first_edition: editItem.is_first_edition,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setEditItem(null);
      fetchCollection();
      toast.success("Edit successful.");
      console.log("Edit successful", response.data);
    } catch (error) {
      console.error(
        "Failed to edit item:",
        error.response ? error.response.data : error
      );
      toast.error("Failed to edit item.");
    }
  };

  const handleDelete = async (userItemId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/items/${userItemId}/user/${user.username}/delete`
      );
      fetchCollection(); // Refresh the list
      toast.success("Deleted successfully.");
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Failed to delete item.");
    }
  };

  const openEditDialog = (card) => {
    setEditItem({
      ...card,
      user_item_id: card.user_item_id,
      quantity: card.user_item_details.quantity,
      condition: card.user_item_details.condition || "",
      extras: card.user_item_details.extras || "",
      is_first_edition: card.user_item_details.is_first_edition || null,
    });
  };

  const filteredCollection = collection.filter(card =>
    (sourceTableFilter === "" || card.source_table === sourceTableFilter) &&
    (languageFilter === "" || card.language === languageFilter) &&
    card.source_item_details.name.toLowerCase().includes(searchName.toLowerCase())
  );

  const calculateTotalPrices = (cards, isEuroDisplayed) => {
    let totalLow = 0, totalHigh = 0, totalMedian = 0, totalMean = 0;
  
    cards.forEach(card => {
      let factor = 1; // Default factor for DOLLAR
      if (card.prices.currency === "EURO" && !isEuroDisplayed) {
        factor = EURO_TO_DOLLAR_RATE;
      }
      if (card.prices.currency === "DOLLAR" && isEuroDisplayed) {
        factor = 1 / EURO_TO_DOLLAR_RATE;
      }
      totalLow += parseFloat(card.prices.low || 0) * factor;
      totalHigh += parseFloat(card.prices.high || 0) * factor;
      totalMedian += parseFloat(card.prices.median || 0) * factor;
      totalMean += parseFloat(card.prices.mean || 0) * factor;
    });
  
    return { totalLow, totalHigh, totalMedian, totalMean };
  };  
  
  const totals = calculateTotalPrices(filteredCollection, isEuroDisplayed);


  return (
    <div>
      <FormControl fullWidth margin="normal">
        <InputLabel id="source-table-filter-label">Source Table</InputLabel>
        <Select
          labelId="source-table-filter-label"
          value={sourceTableFilter}
          onChange={(e) => setSourceTableFilter(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {cardTypeOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel id="language-filter-label">Language</InputLabel>
        <Select
          labelId="language-filter-label"
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {languageOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        margin="normal"
        label="Search by Name"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
      />

      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 20 }}>
        <Button onClick={() => setIsEuroDisplayed(!isEuroDisplayed)} variant="contained" style={{ marginBottom: 10 }}>
          {isEuroDisplayed ? "Show in $" : "Show in €"}
        </Button>
        {['Low', 'High', 'Median', 'Mean'].map((key) => (
          <Card key={key} variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total {key} Price
              </Typography>
              <Typography variant="h5">
                {(isEuroDisplayed ? '€' : '$') + totals[`total${key}`].toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button onClick={() => setIsEuroDisplayed(!isEuroDisplayed)}>
        {isEuroDisplayed ? "Show in $" : "Show in €"}
      </Button>

      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Set Number</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Condition</TableCell>
              <TableCell align="right">1st ed.</TableCell>
              <TableCell align="right">Low Price</TableCell>
              <TableCell align="right">High Price</TableCell>
              <TableCell align="right">Median Price</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCollection.map((card, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {card.source_item_details.name}
                </TableCell>
                <TableCell align="right">
                  {card.source_table === "cards_yugioh"
                    ? card.source_item_details.set_number
                    : card.source_item_details.local_id}
                </TableCell>
                <TableCell align="right">
                  {card.user_item_details.quantity}
                </TableCell>
                <TableCell align="right">
                  {card.user_item_details.condition}
                </TableCell>
                <TableCell align="right">
                  {card.user_item_details.is_first_edition ? (
                    <CheckCircleIcon style={{ color: 'green' }} />
                  ) : (
                    <RemoveCircleOutlineIcon style={{ color: 'red' }} />
                  )}
                </TableCell>
                <TableCell align="right">
                  {card.prices.low ? card.prices.low.concat(card.prices.currency === "DOLLAR"
                    ? "$"
                    : card.prices.currency === "EURO"
                    ? "€"
                    : "") : ""}
                </TableCell>
                <TableCell align="right">
                  {card.prices.high ? card.prices.high.concat(card.prices.currency === "DOLLAR"
                    ? "$"
                    : card.prices.currency === "EURO"
                    ? "€"
                    : ""): ""}
                </TableCell>
                <TableCell align="right">
                  {card.prices.median ? card.prices.median.concat(card.prices.currency === "DOLLAR"
                    ? "$"
                    : card.prices.currency === "EURO"
                    ? "€"
                    : ""): ""}
                </TableCell>
                <TableCell align="right">
                  <Button onClick={() => openEditDialog(card)}>Edit</Button>
                  <Button onClick={() => handleDelete(card.user_item_id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {editItem && (
        <Dialog open={Boolean(editItem)} onClose={() => setEditItem(null)}>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Quantity"
              type="number"
              fullWidth
              value={editItem.quantity}
              onChange={(e) =>
                setEditItem({
                  ...editItem,
                  quantity: parseInt(e.target.value, 10) || 0,
                })
              }
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="condition-label">Condition</InputLabel>
              <Select
                labelId="condition-label"
                value={editItem.condition}
                label="Condition"
                onChange={(e) =>
                  setEditItem({ ...editItem, condition: e.target.value })
                }
              >
                <MenuItem value="poor">Poor</MenuItem>
                <MenuItem value="played">Played</MenuItem>
                <MenuItem value="light_played">Light Played</MenuItem>
                <MenuItem value="good">Good</MenuItem>
                <MenuItem value="excellent">Excellent</MenuItem>
                <MenuItem value="near_mint">Near Mint</MenuItem>
                <MenuItem value="mint">Mint</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Extras"
              fullWidth
              value={editItem.extras}
              onChange={(e) =>
                setEditItem({ ...editItem, extras: e.target.value })
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={editItem.is_first_edition}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      is_first_edition: e.target.checked,
                    })
                  }
                />
              }
              label="Is First Edition"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleEditItem}>Save</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default UserCardsTable;
