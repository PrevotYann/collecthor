import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";
import {
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
} from "@mui/material";

const UserCardsTable = () => {
  const { user } = useAuth();
  const [collection, setCollection] = useState([]);
  const [sourceTableFilter, setSourceTableFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [searchName, setSearchName] = useState("");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/items/user/${user.username}`
        );
        setCollection(response.data || []); // Ensure it defaults to an empty array if null is returned
      } catch (error) {
        console.error("Failed to fetch collection:", error);
      }
    };

    if (user && user.username) {
      fetchCollection();
    }
  }, [user]); // Only re-run the effect if `user` changes

  const filteredCards = useMemo(() => {
    let results = collection;
    if (sourceTableFilter) {
      results = results.filter(
        (card) => card.source_table === sourceTableFilter
      );
    }
    if (languageFilter) {
      results = results.filter(
        (card) => card.source_item_details.language === languageFilter
      );
    }
    if (searchName) {
      results = results.filter((card) =>
        card.source_item_details.name
          .toLowerCase()
          .includes(searchName.toLowerCase())
      );
    }
    if (sortBy === "name") {
      results.sort((a, b) =>
        a.source_item_details.name.localeCompare(b.source_item_details.name)
      );
    } else {
      results.sort(
        (a, b) =>
          new Date(b.user_item_details.added_date) -
          new Date(a.user_item_details.added_date)
      );
    }
    console.log(results);
    return results;
  }, [sourceTableFilter, languageFilter, searchName, sortBy, collection]);

  return (
    <div>
      {/* Filter Controls */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="source-table-filter-label">Source Table</InputLabel>
        <Select
          labelId="source-table-filter-label"
          value={sourceTableFilter}
          onChange={(e) => setSourceTableFilter(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="cards_yugioh">Yu-Gi-Oh</MenuItem>
          <MenuItem value="cards_pokemon">Pokémon</MenuItem>
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
          <MenuItem value="fr">French</MenuItem>
          <MenuItem value="en">English</MenuItem>
        </Select>
      </FormControl>
      <TextField
        fullWidth
        margin="normal"
        label="Search by Name"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
      />

      {/* Data Table Display */}
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Set Number</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Condition</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCards.map((card, index) => (
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
                  <Button onClick={() => console.log("Edit")}>Edit</Button>
                  <Button onClick={() => console.log("Delete")}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default UserCardsTable;
