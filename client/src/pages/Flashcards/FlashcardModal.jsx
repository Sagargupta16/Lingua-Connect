import React from "react";
import ReactDOM from "react-dom";
import classes from "./FlashcardModal.module.css";
import { useEffect } from "react";
import { getFlashcardRoute } from "../../api/flashcardApi";
import { useState } from "react";
import Flashcard from "./Flashcard";

const FlashcardModal = ({ isOpen, onClose, language, id }) => {
  const [flashcards, setFlashcards] = useState([]);
  useEffect(() => {
    if (!isOpen) return;
    const fetchFlashcards = async () => {
      const response = await getFlashcardRoute(id, language);
      setFlashcards(response.data);
    };
    fetchFlashcards();
  }, [isOpen, id, language]);

  // const flashcards = [
  //   {
  //     _id: "1",
  //     question: "Front 1",
  //     answer: "Back 1",
  //   },
  //   {
  //     _id: "2",
  //     question: "Front 2",
  //     answer: "Back 2",
  //   },
  // ];

  // const handlecreateFlashcard = () => {
  //   console.log("Create Flashcard");
  // };

  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div className={classes.overlay}>
      <div className={classes.modal}>
        <span className={classes["logo-badge"]}>{language} Flashcards</span>

        <ul className={classes["flashcards"]}>
          {flashcards.map((flashcard) => (
            <Flashcard flashcard={flashcard} key={flashcard._id} />
          ))}
        </ul>
        <button className={classes["modal_close_btn"]} onClick={onClose}>
          Close
        </button>
      </div>
    </div>,
    document.getElementById("modal-root"),
  );
};

export default FlashcardModal;
