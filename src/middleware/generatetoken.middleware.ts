import jwt from "jsonwebtoken";

const generateToken = (userid:string , isAdmin:boolean ) => {

    const jwtSecret:string = process.env.JWT_SECRET || "jwtsecret"  ;
    const token = jwt.sign(
        { user: { userid, isAdmin } },
        jwtSecret,
    );
    return token;
};

export default generateToken;




