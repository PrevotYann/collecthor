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
  Pagination,
} from "@mui/material";
import { toast } from "react-toastify";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

const cardTypeOptions = [
  { value: "cards_pokemon", label: "Pokémon" },
  { value: "cards_yugioh", label: "Yu-Gi-Oh!" },
];

const cardTypeDisplay = {
  cards_pokemon: "Pokémon",
  cards_yugioh: "Yu-Gi-Oh!",
};

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

const conditionOptions = {
  poor: "POOR",
  played: "PL",
  light_played: "LP",
  good: "GOOD",
  excellent: "EXC",
  near_mint: "NM",
  mint: "MINT",
};

const UserCardsTable = () => {
  const { user } = useAuth();
  const [collection, setCollection] = useState([]);
  const [sourceTableFilter, setSourceTableFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [searchName, setSearchName] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [isEuroDisplayed, setIsEuroDisplayed] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "prices.median",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [priceAggregates, setPriceAggregates] = useState({
    low: 0,
    high: 0,
    mean: 0,
    median: 0,
    currency: "DOLLAR",
  });

  const pageSize = 20;
  const EURO_TO_DOLLAR_RATE = 1.058314;

  const fetchCollection = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/items/user/v3/${user.username}`
      );
      setCollection(response.data || []); // Safely handle items
    } catch (error) {
      console.error("Failed to fetch collection:", error);
    }
  };

  // Fetch price aggregates
  const fetchPriceAggregates = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/items/user/${user.username}/collection/prices`
      );
      setPriceAggregates(response.data);
    } catch (error) {
      console.error("Failed to fetch price aggregates:", error);
    }
  };

  useEffect(() => {
    if (user && user.username) {
      fetchCollection();
      fetchPriceAggregates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const getConvertedValue = (value) =>
    isEuroDisplayed
      ? (value / EURO_TO_DOLLAR_RATE).toFixed(2)
      : value.toFixed(2);

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
      is_first_edition: card.user_item_details.is_first_edition || false,
    });
  };

  const filteredCollection = collection.filter(
    (card) =>
      (sourceTableFilter === "" || card.source_table === sourceTableFilter) &&
      (languageFilter === "" || card.language === languageFilter) &&
      card.item_name.toLowerCase().includes(searchName.toLowerCase())
  );

  const sortCollection = (collection, config) => {
    if (!config.key) return collection;

    const sorted = [...collection].sort((a, b) => {
      let aKey = a,
        bKey = b;

      // Navigate through nested keys (e.g., "prices.low" or "code")
      for (const key of config.key.split(".")) {
        aKey = aKey[key];
        bKey = bKey[key];
      }

      // Special handling for alphanumeric codes (natural sort)
      const naturalSort = (a, b) => {
        return a.localeCompare(b, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      };

      // If the key is 'code', use naturalSort; otherwise, use numeric comparison
      if (
        config.key === "code" ||
        config.key === "item_name" ||
        config.key === "type" ||
        config.key === "language"
      ) {
        return config.direction === "desc"
          ? naturalSort(aKey, bKey)
          : naturalSort(bKey, aKey);
      }

      // For other keys (like prices), parse as numbers
      const normalizeValue = (value) =>
        typeof value === "string"
          ? parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0
          : parseFloat(value) || 0;

      aKey = normalizeValue(aKey);
      bKey = normalizeValue(bKey);

      if (aKey < bKey) return config.direction === "asc" ? -1 : 1;
      if (aKey > bKey) return config.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const sortedCollection = sortCollection(filteredCollection, sortConfig);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Paginate the sorted and filtered collection
  const paginatedCollection = sortedCollection.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5">My Collection</Typography>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: 20,
          }}
        >
          <Button
            onClick={() => setIsEuroDisplayed(!isEuroDisplayed)}
            variant="contained"
            style={{ marginBottom: 10 }}
          >
            {isEuroDisplayed ? "Show in $" : "Show in €"}
          </Button>
          {["low", "high", "median", "mean"].map((key) => (
            <Card key={key} variant="outlined">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total {key.charAt(0).toUpperCase() + key.slice(1)}
                </Typography>
                <Typography variant="h6">
                  {isEuroDisplayed ? "€" : "$"}
                  {getConvertedValue(priceAggregates[key])}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <TextField
            label="Search by Name"
            variant="outlined"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{ width: "200px", marginRight: "16px" }}
          />
          <FormControl variant="outlined" style={{ marginRight: "16px" }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={sourceTableFilter}
              onChange={(e) => setSourceTableFilter(e.target.value)}
              label="Filter by Type"
            >
              <MenuItem value="">All</MenuItem>
              {cardTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined">
            <InputLabel>Filter by Language</InputLabel>
            <Select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              label="Filter by Language"
            >
              <MenuItem value="">All</MenuItem>
              {languageOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  onClick={() => handleSort("item_name")}
                  style={{ cursor: "pointer" }}
                >
                  Name{" "}
                  {sortConfig.key === "item_name" &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowDownwardIcon />
                    ) : (
                      <ArrowUpwardIcon />
                    ))}
                </TableCell>
                <TableCell
                  onClick={() => handleSort("type")}
                  style={{ cursor: "pointer" }}
                >
                  Type{" "}
                  {sortConfig.key === "type" &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowDownwardIcon />
                    ) : (
                      <ArrowUpwardIcon />
                    ))}
                </TableCell>
                <TableCell
                  onClick={() => handleSort("language")}
                  style={{ cursor: "pointer" }}
                >
                  Language{" "}
                  {sortConfig.key === "language" &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowDownwardIcon />
                    ) : (
                      <ArrowUpwardIcon />
                    ))}
                </TableCell>
                <TableCell
                  onClick={() => handleSort("code")}
                  style={{ cursor: "pointer" }}
                >
                  Code{" "}
                  {sortConfig.key === "code" &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowDownwardIcon />
                    ) : (
                      <ArrowUpwardIcon />
                    ))}
                </TableCell>
                <TableCell
                  onClick={() => handleSort("prices.low")}
                  style={{ cursor: "pointer" }}
                >
                  Low{" "}
                  {sortConfig.key === "prices.low" &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowDownwardIcon />
                    ) : (
                      <ArrowUpwardIcon />
                    ))}
                </TableCell>
                <TableCell
                  onClick={() => handleSort("prices.high")}
                  style={{ cursor: "pointer" }}
                >
                  High{" "}
                  {sortConfig.key === "prices.high" &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowDownwardIcon />
                    ) : (
                      <ArrowUpwardIcon />
                    ))}
                </TableCell>
                <TableCell
                  onClick={() => handleSort("prices.median")}
                  style={{ cursor: "pointer" }}
                >
                  Median{" "}
                  {sortConfig.key === "prices.median" &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowDownwardIcon />
                    ) : (
                      <ArrowUpwardIcon />
                    ))}
                </TableCell>
                <TableCell
                  onClick={() => handleSort("prices.mean")}
                  style={{ cursor: "pointer" }}
                >
                  Mean{" "}
                  {sortConfig.key === "prices.mean" &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowDownwardIcon />
                    ) : (
                      <ArrowUpwardIcon />
                    ))}
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCollection.map((card) => (
                <TableRow key={card.user_item_id}>
                  <TableCell>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: card.item_name,
                      }}
                    />
                  </TableCell>
                  <TableCell>{cardTypeDisplay[card.source_table]}</TableCell>
                  <TableCell>{card.language}</TableCell>
                  <TableCell>{card.code}</TableCell>
                  <TableCell>
                    {isEuroDisplayed
                      ? "€" +
                        (
                          parseFloat(card.prices.low) / EURO_TO_DOLLAR_RATE
                        ).toFixed(2)
                      : "$" + parseFloat(card.prices.low).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {isEuroDisplayed
                      ? "€" +
                        (
                          parseFloat(card.prices.high) / EURO_TO_DOLLAR_RATE
                        ).toFixed(2)
                      : "$" + parseFloat(card.prices.high).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {isEuroDisplayed
                      ? "€" +
                        (
                          parseFloat(card.prices.median) / EURO_TO_DOLLAR_RATE
                        ).toFixed(2)
                      : "$" + parseFloat(card.prices.median).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {isEuroDisplayed
                      ? "€" +
                        (
                          parseFloat(card.prices.mean) / EURO_TO_DOLLAR_RATE
                        ).toFixed(2)
                      : "$" + parseFloat(card.prices.mean).toFixed(2)}
                  </TableCell>
                  <TableCell>
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          {/* Pagination */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            {sortedCollection.length > pageSize && (
              <Pagination
                count={Math.ceil(sortedCollection.length / pageSize)}
                page={currentPage}
                onChange={handlePageChange}
                variant="outlined"
                shape="rounded"
              />
            )}
          </div>
        </div>
        <Dialog open={!!editItem} onClose={() => setEditItem(null)}>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogContent>
            {editItem && (
              <>
                <TextField
                  label="Quantity"
                  type="number"
                  value={editItem.quantity}
                  onChange={(e) =>
                    setEditItem({ ...editItem, quantity: e.target.value })
                  }
                  fullWidth
                  margin="normal"
                />
                <FormControl variant="outlined" fullWidth margin="normal">
                  <InputLabel>Condition</InputLabel>
                  <Select
                    value={editItem.condition}
                    onChange={(e) =>
                      setEditItem({ ...editItem, condition: e.target.value })
                    }
                    label="Condition"
                  >
                    {Object.keys(conditionOptions).map((key) => (
                      <MenuItem key={key} value={key}>
                        {conditionOptions[key]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Extras"
                  value={editItem.extras}
                  onChange={(e) =>
                    setEditItem({ ...editItem, extras: e.target.value })
                  }
                  fullWidth
                  margin="normal"
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
                  label="First Edition"
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleEditItem} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UserCardsTable;
