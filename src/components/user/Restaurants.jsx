import axios from "axios";
import React, { useEffect, useState } from "react";
import "../../assets/screencard.css";
import "../../assets/screencardperticuler.css";
import { CustomLoader } from "../common/CustomLoader";
import { useNavigate } from "react-router-dom";
  
export const Restaurants = () => {
  const [screen, setScreen] = useState([]);
  const [filteredScreens, setFilteredScreens] = useState([]);
  const [isLoader, setIsLoader] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]); 
  const [areas, setAreas] = useState([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  const [ratings, setRatings] = useState([]);

  const getAllRatings = async () => {
    try {
      const res = await axios.get("/rating/getall");
      setRatings(res.data.data);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  // Fetch all restaurants
  const getAllMyScreen = async () => {
    setIsLoader(true);
    try {
      const res = await axios.get("/location/getall");
      setScreen(res.data.data);
      setFilteredScreens(res.data.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
    setIsLoader(false);
  };

  // Fetch all states, cities, and areas
  const getAllStates = async () => {
    const res = await axios.get("/state/getallstate");
    setStates(res.data.data);
  };

  const getAllCities = async () => {
    const res = await axios.get("/city/getallcity");
    setCities(res.data.data);
  };

  const getAllAreas = async () => {
    const res = await axios.get("/area/getallarea");
    setAreas(res.data.data);
  };

  useEffect(() => {
    getAllMyScreen();
    getAllStates();
    getAllCities();
    getAllAreas();
    getAllRatings();
  }, []);

  const getAverageRating = (restaurantName) => {
    const restaurantRatings = ratings.filter(
      (rating) => rating.restaurantName === restaurantName
    );
    if (restaurantRatings.length === 0) return 0;

    const total = restaurantRatings.reduce((sum, r) => sum + r.rating, 0);
    return (total / restaurantRatings.length).toFixed(1);
  };

  const renderStars = (rating) => {
    const stars = [];

    for (let i = 0; i < 5; i++) {
      const fill = Math.max(0, Math.min(1, rating - i)) * 100;

      stars.push(
        <div key={i} className="star-wrapper">
          <span className="star empty">★</span>
          <span className="star full" style={{ width: `${fill}%` }}>
            ★
          </span>
        </div>
      );
    }

    return <div className="star-rating">{stars}</div>;
  };

  // Handlers
  const handleStateChange = (e) => {
    const stateId = e.target.value;
    setSelectedState(stateId);
    setSelectedCity("");
    setSelectedArea("");

    const filtered = stateId
      ? screen.filter((sc) => sc.stateId?._id === stateId)
      : screen;

    setFilteredScreens(filtered);
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    setSelectedCity(cityId);
    setSelectedArea("");

    const filtered = cityId
      ? screen.filter((sc) => sc.cityId?._id === cityId)
      : screen.filter((sc) =>
          selectedState ? sc.stateId?._id === selectedState : true
        );

    setFilteredScreens(filtered);
  };

  const handleAreaChange = (e) => {
    const areaId = e.target.value;
    setSelectedArea(areaId);

    const filtered = areaId
      ? screen.filter((sc) => sc.areaId?._id === areaId)
      : screen.filter((sc) =>
          selectedCity ? sc.cityId?._id === selectedCity : true
        );

    setFilteredScreens(filtered);
  };

  const applyFilters = () => {
    let filtered = [...screen];
  
    if (searchTerm.trim()) {
      filtered = filtered.filter((sc) =>
        sc.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  
    setFilteredScreens(filtered);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    applyFilters();
  }, [screen, searchTerm]);
  

  const navigate = useNavigate();

  const handleCardClick = (restaurantName) => {
    navigate(`/user/offers/${encodeURIComponent(restaurantName)}`);
  };

  return (
    <div className="screen-container">
      {isLoader && <CustomLoader />}
      <h2 className="title">OUR Restaurant</h2>

{/* 🔍 Filters */}
      
<div className="search-bar">
          <input
            type="text"
            placeholder="Search by Restaurant Name..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <label>Select State:</label>
        <select value={selectedState} onChange={handleStateChange}>
          <option value="">All States</option>
          {states.map((state) => (
            <option key={state._id} value={state._id}>
              {state.name}
            </option>
          ))}
        </select>

        <label>Select City:</label>
        <select value={selectedCity} onChange={handleCityChange}>
          <option value="">All Cities</option>
          {cities
            .filter(
              (city) =>
                city.stateId === selectedState ||
                city.stateId?._id === selectedState
            )
            .map((city) => (
              <option key={city._id} value={city._id}>
                {city.name}
              </option>
            ))}
        </select>

        <label>Select Area:</label>
        <select value={selectedArea} onChange={handleAreaChange}>
          <option value="">All Areas</option>
          {areas
            .filter(
              (area) =>
                area.cityId === selectedCity ||
                area.cityId?._id === selectedCity
            )
            .map((area) => (
              <option key={area._id} value={area._id}>
                {area.name}
              </option>
            ))}
        </select>
      </div>

      {/* Restaurant Cards */}
      <div className="offer-grid">
        {Array.isArray(filteredScreens) && filteredScreens.length > 0 ? (
          filteredScreens.map((sc) => (
            <div
              className="offer-card"
              key={sc._id}
              onClick={() => handleCardClick(sc.title)}
              style={{ cursor: "pointer" }}
            >
              <div className="image-container">
                <img
                  src={sc?.imageURL || "https://via.placeholder.com/200"}
                  alt="Screen"
                  className="screen-image"
                />
                <div className="rating-overlay">
                  {renderStars(Number(getAverageRating(sc.title)))}
                  <span className="rating-value">
                    ({getAverageRating(sc.title)})
                  </span>
                </div>
              </div>
              <div className="screen-details">
                <div className="info">
                  <strong>Restaurant Name:</strong> {sc.title || "N/A"}
                </div>
                <div className="info">
                  <strong>Description:</strong> {sc.description || "N/A"}
                </div>
                <div className="info">
                  <strong>State:</strong> {sc.stateId?.name || "N/A"}
                </div>
                <div className="info">
                  <strong>City:</strong> {sc.cityId?.name || "N/A"}
                </div>
                <div className="info">
                  <strong>Area:</strong> {sc.areaId?.name || "N/A"}
                </div>
                <div className="info">
                  <strong>Location:</strong> {sc.address || "N/A"}
                </div>
                <div className="info">
                  <strong>Timing:</strong> {sc.timing || "N/A"}
                </div>
                <div className="info">
                  <strong>Avg Rating:</strong>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      marginLeft: "8px",
                    }}
                  >
                    {renderStars(Number(getAverageRating(sc.title)))}
                    <span
                      style={{
                        marginLeft: "6px",
                        marginTop: "5px",
                        color: "#444",
                        fontSize: "14px",
                      }}
                    >
                      ({getAverageRating(sc.title)})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">No restaurants available</p>
        )}
      </div>
    </div>
  );
};
