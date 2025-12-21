import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Configure axios to use the backend directly
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

export { api };
