require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");


require("./db/conn");
const Register = require("./models/registers");
const { checkPrime } = require("crypto");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));
app.set("view engine", "hbs")
app.set("views", template_path);

hbs.registerPartials(partials_path);

console.log(process.env.SECRET_KEY);


app.get("/", (req, res) => {
    res.render("index")
});

app.get("/secret", auth, (req, res) => {
    // console.log(`this is the best cookie  ${req.cookies.jwt}`);
    res.render("secret")
});


app.get("/logout", auth, async (req, res) => {
    try {
        console.log(req.user);

        // for signle logout
        // req.user.tokens = req.user.tokens.filter((currentelement)=>{
        console.log("logout successfull");

        await req.user.save();
        res.render("login");
    } catch (error) {
        res.status(500).send(error);
    }
})

app.get("/register", (req, res) => {
    res.render("register");
})

app.get("/login", (req, res) => {
    res.render("login");
})


// API call
app.post("/register", async (req, res) => {
    // console.log(req.body);
    try {

        const password = req.body.password;
        const cpassword = req.body.cpassword;

        console.log(req.body.password);
        if (password === cpassword) {

            const registeremployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                password: password,
                confirmpassword: cpassword
            })

            console.log("the succespart" + registeremployee);

            const token = await registeremployee.generateAuthToken();
            console.log("the token part " + token);


            await registeremployee.save();
            // console.log(res.status);
            res.status(201).render("index");

        } else {
            res.send("password are not matching");
        }

    } catch (error) {
        res.status(400).send(error);
        console.log("the error part page");
    }
})


// login check
app.post("/login", async (req, res) => {
    try {
        // console.log(req.body);
        const email = req.body.email;
        const password = req.body.pass;

        const useremail = await Register.findOne({ email: email });

        const ismatch = await bcrypt.compare(password, useremail.password);

        const token = await useremail.generateAuthToken();
        console.log("the token part " + token);

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 60000),
            httpOnly: true,
            //secure: true
        });

        if (ismatch) {
            res.status(201).render("index");
        } else {
            res.send("invalid login details")
        }

    } catch (error) {
        res.status(400).send("invalid login details")
    }
})


// bcrypt secure
const securepassword = async (password) => {

    const passwordhash = await bcrypt.hash(password, 10);
    // console.log(passwordhash);

    const passwordmatch = await bcrypt.compare("0987", passwordhash);
    // console.log(passwordmatch);
}
securepassword("0987");

 
// json `req.cookies.jwt`jwt = require("jsonwebtoken");
const createtoken = async () => {
    const token = await jwt.sign({ _id: "64df0c7e4f4b2be71cc05bcf" }, "mynameisarchitbhuva", {
        expiresIn: "2 seconds"
    });
    // console.log(token);

    const userver = await jwt.verify(token, "mynameisarchitbhuva");
    // console.log(userver);
}
createtoken()


app.listen(port, () => {
    console.log(`server is running at port no ${3000}`);
});