import axios from "axios";

const hub_api_url = import.meta.env.VITE_HUB_API_URL;

export const hubAxiosClient = axios.create({
  baseURL: hub_api_url,
  withCredentials: true,
});
