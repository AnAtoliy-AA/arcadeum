import axios from 'axios';
import { resolveApiBase } from '@/lib/apiBase';

const API_URL = resolveApiBase();

export const getUser = async (id: string) => {
  const res = await axios.get(`${API_URL}/user/${id}`);
  return res.data;
};