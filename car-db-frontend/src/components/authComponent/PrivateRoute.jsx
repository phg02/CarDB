import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import axios from "axios";

export default function PrivateRoute({ children, allowedRole}) {
    const { auth, loading } = useAuth();
    const location = useLocation();

    useEffect(() => {
        // If user is authenticated but not verified, send OTP
        if (auth?.accessToken && !auth?.verified) {
            sendOTPToUser();
        }
    }, [auth?.accessToken, auth?.verified]);

    const sendOTPToUser = async () => {
        try {
            const response = await axios.post(
                "/api/auth/send-otp",
                { email: auth.email },
                { 
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${auth.accessToken}`
                    }
                }
            );
            console.log("OTP sent:", response.data);
        } catch (error) {
            console.error("Failed to send OTP:", error);
        }
    };

    // Show loading indicator while auth state is being determined
    if (loading){
        return <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
            </div>
        </div>
    }

    // If not authenticated, redirect to login with return location
    if(!auth?.accessToken){
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated but not verified, redirect to OTP verification
    if(!auth?.verified){
        return <Navigate to="/verification-code" state={{ from: location }} replace />;
    }

    // Role based access control
    if(allowedRole && auth.role !== allowedRole){
        return <Navigate to="/login" state={{ from: location }} />;
    }
    return typeof children === "function" ? children(auth) : children;
}       