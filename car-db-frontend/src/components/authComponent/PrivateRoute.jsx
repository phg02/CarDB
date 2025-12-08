import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, allowedRole}) {
    const { auth, loading } = useAuth();
    // Show loading indicator while auth state is being determined
    if (loading){
        return <div>loading</div>
    }

    // If not authenticated, redirect to login
    if(!auth?.accessToken || !auth){
        return <Navigate to="/login" replace />;
    }
    // Role based access control
    if(allowedRole && auth.role !== allowedRole){
        return <Navigate to="/login" />;
    }
    return typeof children === "function" ? children(auth) : children;
}       