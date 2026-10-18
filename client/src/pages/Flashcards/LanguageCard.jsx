import React from "react";
import { useState } from "react";
import classes from "./LanguageCard.module.css";
import FlashcardModal from "./FlashcardModal";

import { jwtDecode } from "jwt-decode";

const LanguageCard = ({ language, count }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const decodedToken = jwtDecode(localStorage.getItem("token"));
  const handleClick = () => {
    setModalOpen(true);
  };
  return (
    <>
      <div className={classes["card"]} onClick={handleClick}>
        <div className={classes["card-content"]}>
          <h3>{language}</h3>
          <span className={classes.count}>
            {count} {count === 1 ? "card" : "cards"}
          </span>
        </div>
      </div>
      <FlashcardModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        language={language}
        id={decodedToken.id}
      />
    </>
  );
};

export default LanguageCard;
