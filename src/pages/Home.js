import React, { useEffect } from "react";
import axios from "axios";

function Home() {
  useEffect(() => {
    const url = `${process.env.REACT_APP_API_URL}/hello`;
    try {
      const response = await axios.get(url);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  }, []);
  
  return <div>Click on cards.</div>;
}

export default Home;
