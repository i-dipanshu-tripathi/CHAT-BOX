import axios from "axios";

export const url = "https://chat-box-client.onrender.com";
export const axiosInstance = axios.create({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
