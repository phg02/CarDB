import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader);
    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    
    jwt.verify(token, process.env.JWT_SECRET, (err,user)=>{
        if(err){
            console.log("Authorization Header:", authHeader);
            return res.status(403).json({ message: "Forbidden: Invalid token" });
        }
        req.user = user;
        next();
    });
}


export const verifyRole = (role)=>{
    return (req,res,next)=>{
        const userRole = req.user?.role;
        console.log("User Role:", userRole);
        if(userRole !== role){
            return res.status(403).json({ message: "Forbidden: Access denied" });
        }
        next();
    }
}