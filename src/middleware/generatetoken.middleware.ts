import jwt from "jsonwebtoken";

const generateToken = (userid:string , role:string ) => {

    const jwtSecret:string = process.env.JWT_SECRET || "jwtsecret"  ;
    const token = jwt.sign(
        { user: { userid, role } },
        jwtSecret,
    );
    return token;
};

export default generateToken;




