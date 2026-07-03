import React from "react";
import ReactDOM from "react-dom";
import classes from "./CreateFlashcardModal.module.css";
import { createFlashcardRoute } from "../../api/flashcardApi";
import { jwtDecode } from "jwt-decode";

const CreateFlashcardModal = ({ isOpen, onClose }) => {
   const decodedToken = jwtDecode(localStorage.getItem("token"));
   const userId = decodedToken.id;

   const flashcardSubmitHandler = async (e) => {
      e.preventDefault();
      const response = await createFlashcardRoute(userId, {
         language: e.target[0].value,
         question: e.target[1].value,
         answer: e.target[2].value,
      });

      if (response.status === 200) {
         onClose();
      } else {
         console.log("Error creating flashcard");
      }
   };

   if (!isOpen) return null;
   return ReactDOM.createPortal(
      <div className={classes.overlay}>
         <div className={classes.modal}>
            <span className={classes["logo-badge"]}>Create Flashcards</span>

            <form
               className={classes["input-form"]}
               onSubmit={flashcardSubmitHandler}
            >
               <input
                  id="input-id"
                  type="text"
                  placeholder="Language"
                  required
               />
               <input
                  id="input-id"
                  type="text"
                  placeholder="Question"
                  required
               />
               <input id="input-id" type="text" placeholder="Answer" required />
               <button className={classes["modal_btn"]}>Create</button>
            </form>

            <button className={classes["modal_close_btn"]} onClick={onClose}>
               Close
            </button>
         </div>
      </div>,
      document.getElementById("modal-root"),
   );
};

export default CreateFlashcardModal;
