import axiosInstance from "./axiosInstance";

// The caller's own flashcards, across every language.
export const getMyFlashcards = () => axiosInstance.get("/flashcard/view");

export const getFlashcardRoute = (id, language) => {
  return axiosInstance.post(`/flashcard/get/${id}`, { language: language });
};

export const createFlashcardRoute = (id, flashcard) => {
  return axiosInstance.post(`/flashcard/create/${id}`, flashcard);
};
