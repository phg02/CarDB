import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";

export default function PrivateRoute({ children, allowedRole}) {
    const { auth, loading } = useAuth();
    const [sendingOtp, setSendingOtp] = useState(false);

    useEffect(() => {
        // If user is authenticated but not verified, send OTP
        if (auth?.accessToken && !auth?.verified) {
            sendOTPToUser();
        }
    }, [auth]);

    const sendOTPToUser = async () => {
        if (sendingOtp) return; // Prevent duplicate requests
        setSendingOtp(true);
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
        } finally {
            setSendingOtp(false);
        }
    };

    // Show loading indicator while auth state is being determined
    if (loading){
        return <div>loading</div>
    }

    // If not authenticated, redirect to login
    if(!auth?.accessToken || !auth){
        return <Navigate to="/login" replace />;
    }

    // If authenticated but not verified, redirect to OTP verification
    if(!auth?.verified){
        return <Navigate to="/verification-code" replace />;
    }

    // Role based access control
    if(allowedRole && auth.role !== allowedRole){
        return <Navigate to="/login" />;
    }
    return typeof children === "function" ? children(auth) : children;
}       