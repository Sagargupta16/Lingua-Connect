import axiosInstance from "./axiosInstance";

export const getStudents = () => axiosInstance.get("/student/view");

export const getStudent = (id) => axiosInstance.get(`/student/view/${id}`);

export const updateStudent = (id, student) =>
  axiosInstance.put(`/student/update/${id}`, student);

export const deleteStudent = (id) =>
  axiosInstance.delete(`/student/delete/${id}`);

export const createCheckoutSession = (item) =>
  axiosInstance.post("/student/create-checkout-session", item);
