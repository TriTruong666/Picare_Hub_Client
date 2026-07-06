import axios from "axios";

const hub_api_url = import.meta.env.VITE_HUB_API_URL;
const local_signing_url = import.meta.env.VITE_LOCAL_SIGNING_URL;

export const hubAxiosClient = axios.create({
  baseURL: hub_api_url,
  withCredentials: true,
});

export const localSigningAxiosClient = axios.create({
  baseURL: local_signing_url,
  withCredentials: false,
});
