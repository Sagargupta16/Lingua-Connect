import axiosInstance from "./axiosInstance";

export const getTutors = () => axiosInstance.get("/tutor/view");

export const getTutor = (id) => axiosInstance.get(`/tutor/view/${id}`);

export const updateTutor = (id, tutor) =>
  axiosInstance.put(`/tutor/update/${id}`, tutor);

export const deleteTutor = (id) => axiosInstance.delete(`/tutor/delete/${id}`);

export const addSlot = (id, slot) =>
  axiosInstance.post(`/tutor/add-slot/${id}`, slot);

export const deleteSlot = (id, slotId) =>
  axiosInstance.delete(`/tutor/delete-slot/${id}/${slotId}`);
