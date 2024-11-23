import React from "react";
import YuGiOhCarrousel from "../components/YuGiOhCarrousel";
import PokemonCarrousel from "../components/PokemonCarrousel";
import FFTCGCarrousel from "../components/FFTCGCarrousel";

function Home() {
  return (
    <>
      <h2>Yu-Gi-Oh! random cards :</h2>
      <YuGiOhCarrousel limit={12} />
      <br />
      <h2>Pokémon random cards :</h2>
      <PokemonCarrousel limit={12} />
      <br />
      <h2>FF TCG random cards :</h2>
      <FFTCGCarrousel limit={12} />
    </>
  );
}

export default Home;
