import { createContext, useContext, useState, useEffect  } from "react";
import api from "../lib/axios";
const AuthContext = createContext();

export const AuthProvider = ({children}) =>{
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(true);  // Start as true to prevent premature redirects

    const updateAuth = (newAuth) => {
        console.log('AuthContext - updating auth:', newAuth ? { hasToken: !!newAuth.accessToken, role: newAuth.role } : 'null');
        setAuth(newAuth);
    };

    useEffect(()=>{
        const checkAuth = async () =>{
            console.log('AuthContext - Starting auth check');
            setLoading(true);
            try{
                console.log('AuthContext - Making refresh request');
                const res = await api.get("/api/auth/refresh");
                console.log('AuthContext - Refresh response:', res.data);
                const userId = res.data.data?.user?.id || res.data.data?.user?._id;
                console.log('AuthContext - Extracted userId from response:', userId);
                
                const newAuth = {
                    accessToken: res.data.accessToken, 
                    userId: userId,
                    name: res.data.data.user.name,
                    role: res.data.data.user.role,
                    verified: res.data.data.user.verified,
                    email: res.data.data.user.email,
                    profileImage: res.data.data.user.profileImage
                };
                console.log('AuthContext - refresh successful:', { hasToken: !!newAuth.accessToken, role: newAuth.role, userId: newAuth.userId });
                setAuth(newAuth);
            }
            catch(error){
                console.log('AuthContext - Auth check failed:', error.response?.data?.message || error.message);
                setAuth(null);
            }
            finally{
                console.log('AuthContext - Auth check complete, setting loading to false');
                setLoading(false);
            }
        }
        checkAuth();
    },[]);
    return (
        <AuthContext.Provider value={{auth, setAuth: updateAuth, loading}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);