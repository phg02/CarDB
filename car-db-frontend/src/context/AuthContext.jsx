import { createContext, useContext, useState, useEffect  } from "react";
import axios from "axios";
const AuthContext = createContext();

export const AuthProvider = ({children}) =>{
    const [auth, setAuth] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const checkAuth = async () =>{
            try{
                const res = await axios.get("/api/auth/refresh", {withCredentials: true});
                setAuth({accessToken: res.data.accessToken, role: res.data.user.role});
            }
            catch{
                setAuth(null);
            }
            finally{
                setLoading(false);
            }
        }
        checkAuth();
    },[]);
    return (
        <AuthContext.Provider value={{auth, setAuth, loading}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);