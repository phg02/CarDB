import {useAuth} from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export const PublicRoute = ({ children }) => {
    const { auth, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  }

  return !auth?.accessToken ? children : <Navigate to="/" />;
}