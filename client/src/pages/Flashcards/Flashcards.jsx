import React from "react";
// import Flashcard from "./Flashcard";
import classes from "./Flashcards.module.css";
import LanguageCard from "./LanguageCard";
import CreateFlashcardModal from "./CreateFlashcardModal";
import { useCallback, useEffect, useState } from "react";
import { getMyFlashcards } from "../../api/flashcardApi";

const Flashcards = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [counts, setCounts] = useState(null);

  // Group the student's cards by language, e.g. { Spanish: 3, French: 2 }.
  const loadDecks = useCallback(async () => {
    const response = await getMyFlashcards();
    const byLanguage = {};
    for (const card of response.data)
      byLanguage[card.language] = (byLanguage[card.language] ?? 0) + 1;
    setCounts(byLanguage);
  }, []);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  const handleClickCreate = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <div className={classes["main-container"]}>
      <div className={classes["flashcards-container"]}>
        {counts &&
          Object.entries(counts).map(([language, count]) => (
            <LanguageCard key={language} language={language} count={count} />
          ))}
        {counts && Object.keys(counts).length === 0 && (
          <p className={classes.empty}>
            No flashcards yet. Create one to start a deck.
          </p>
        )}
      </div>
      <button onClick={handleClickCreate}>Create Flashcard</button>
      <CreateFlashcardModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          loadDecks();
        }}
      />
    </div>
  );
};

export default Flashcards;
