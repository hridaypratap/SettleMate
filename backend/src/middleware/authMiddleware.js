const jwt = require("jsonwebtoken")

const authMiddleware = (req,res,next) =>{
    try {
        const authHeader = req.headers.authorization;
    if (!authHeader){
        return res.status(401).json({
            message: "Authorization Token Required"
        })
    }
    const token = authHeader.split(" ")[1];
    if(!token){
        return res.status(401).json({
            message: "Invalid authorization format"
        })
    }
    const decoded = jwt.verify(token,process.env.JWT_ACCESS_SECRET)

    req.userId = decoded.userId

    next();
        
    } catch (error) {
        console.error("Authentication Error: " , error)
        return res.status(401).json({
            message: "Invalid Or Expired access Token"
        })
        
    }

} 

module.exports = authMiddleware;