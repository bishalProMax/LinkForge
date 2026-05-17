import validator from "validator";
import type { Request, Response, NextFunction } from "express";

//Signup validation
    const validateSignup = (req: Request, res: Response, next: NextFunction): void  => {
    let { name, email, password } = req.body;

    name = name?.trim();
    email = email?.trim().toLowerCase();

    const old = { ...req.body };
    delete old.password; 

    if (!name || name.length < 3) {
        return res.render("signup", {
            error: "Name must be at least 3 characters",
            old,
        });
    }

    if (!email || !validator.isEmail(email)) {
        return res.render("signup", {
            error: "Please enter a valid email address",
            old
        });
    }

    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!password || !strongPassword.test(password)) {
        return res.render("signup", {
            error: "Password must be 8 characters with uppercase, lowercase, number &  special character (@$!%*?&)",
            old
        });
    }

    req.body.name = name
    req.body.email = email
    next();
};

//Login validation

const validateLogin = (req: Request, res: Response, next: NextFunction): void  => {
    let { email, password } = req.body;

    email = email?.trim().toLowerCase();

    const old = { ...req.body };
    delete old.password;

    if (!email || !validator.isEmail(email)) {
        return res.render("login", {
            error: "Please enter a valid email address",
            old,
            verificationMessage: null
        });
    }

    
    if (!password || password.length < 1) {
        return res.render("login", {
            error: "Password is required",
            old,
            verificationMessage: null
        });
    }

    req.body.email = email;

    next();
};

export {
  validateSignup,
  validateLogin,
};
