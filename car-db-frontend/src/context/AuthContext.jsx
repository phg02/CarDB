import { createContext, useContext, useState, useEffect  } from "react";
import axios from "axios";
import { api } from "../lib/utils";
const AuthContext = createContext();

export const AuthProvider = ({children}) =>{
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(false);

    const updateAuth = (newAuth) => {
        console.log('AuthContext - updating auth:', newAuth ? { hasToken: !!newAuth.accessToken, role: newAuth.role } : 'null');
        setAuth(newAuth);
    };

    useEffect(()=>{
        const checkAuth = async () =>{
            try{
                const res = await api.get("/auth/refresh");
                const newAuth = {
                    accessToken: res.data.accessToken, 
                    role: res.data.data.user.role,
                    verified: res.data.data.user.verified,
                    email: res.data.data.user.email
                };
                console.log('AuthContext - refresh successful:', { hasToken: !!newAuth.accessToken, role: newAuth.role });
                setAuth(newAuth);
            }
            catch(error){
                console.log('Auth check failed:', error.response?.data?.message || error.message);
                setAuth(null);
            }
            finally{
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