import axiosInstance from "./axiosInstance";

export const getTests = () => axiosInstance.get("/test/view");

export const getTest = (id) => axiosInstance.get(`/test/view/${id}`);

export const createTest = (test) => axiosInstance.post("/test/create/", test);

export const updateTest = (id, test) =>
  axiosInstance.put(`/test/update/${id}`, test);

export const deleteTest = (id) => axiosInstance.delete(`/test/delete/${id}`);

export const addQuestion = (id, question) =>
  axiosInstance.post(`/test/add-question/${id}`, question);

export const deleteQuestion = (id, questionId) =>
  axiosInstance.delete(`/test/delete-question/${id}/${questionId}`);
