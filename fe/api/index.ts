import axios from 'axios';

const API_URL = 'http://localhost:4000'; // Replace with your backend IP

export const getUser = async (id: string) => {
  const res = await axios.get(`${API_URL}/user/${id}`);
  return res.data;
};