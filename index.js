const express = require("express");
var bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 5500;
const cors = require("cors");

app.set("views", path.join(__dirname, "/public/views"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(path.join(__dirname, "/public")));
app.use(cors());

// Save Username
app.use(
    session({
        secret: "your-secret-key",
        resave: false,
        saveUninitialized: true,
    })
);

// const base_url = "http://localhost:3000";
const base_url = "https://server-system-movie-main.onrender.com";

// Home Routes
app.get("/", (req, res) => {
    const userName = req.session.user ? req.session.user.UserName : "";
    res.render("index", {
        userName,
    });
});

// Register Routes
app.get("/register", async (req, res) => {
    res.render("Register");
});

// Register Route & Insert User Database
app.post("/registerPost", async (req, res) => {
    const data = req.body;
    try {
        await axios.post(`${base_url}/registerPost`, data);
        res.redirect("/login");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

// Login Ejs
app.get("/login", (req, res) => {
    res.render("Login");
});

// Login Route & Check User Database
app.post("/loginPost", async (req, res) => {
    const data = {
        UserName: req.body.username,
        Password: req.body.password,
    };

    try {
        const response = await axios.post(`${base_url}/loginPost`, data);
        console.log(response.data);

        if (response.data.result === "Login successfully") {
            req.session.user = {
                UserName: data.UserName,
                UserID: response.data.UserID,
            };
            res.redirect("/");
        } else {
            window.alert("Login failed: incorrect username or password");
            res.redirect("/login");
        }
    } catch (err) {
        if (err.response && err.response.status === 401) {
            const alertScript =
                "<script>alert('Login failed username or email.'); window.location='/login';</script>";
            res.send(alertScript);
        } else {
            console.error(err);
            res.status(500).send("Error");
        }
    }
});

// Forgetpassword ejs
app.get("/forgetPassword", (req, res) => {
    res.render("forgetPassword");
});

// Update Password Users
app.post("/editPassword", async (req, res) => {
    const {
        email,
        newPassword,
        confirmPassword
    } = req.body;

    try {
        const response = await axios.post(`${base_url}/editPassword`, {
            email,
            newPassword,
            confirmPassword,
        });

        if (response.data === "Password updated successfully.") {
            const alertScript =
                "<script>alert('Update Password Successfully!'); window.location='/login';</script>";
            res.send(alertScript);
        } else {
            window.alert("Edit Password failed");
            res.redirect("/forgetPassword");
        }
    } catch (err) {
        if (err.response && err.response.status === 400) {
            const alertScript =
                "<script>alert('Password do not match.'); window.location='/forgetPassword';</script>";
            res.send(alertScript);
        } else {
            console.error(err.message);
            res.status(500).send("Internal Server Error");
        }
    }
});

// Logout Username Session
app.get("/logout", async (req, res) => {
    try {
        await axios.post(`${base_url}/logout`);
        req.session.destroy();
        res.redirect("/login");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

// Movies Route
app.get("/movies", async (req, res) => {
    try {
        const response = await axios.get(`${base_url}/movies`);
        const userName = req.session.user ? req.session.user.UserName : "";
        res.render("Movie", {
            ...response.data,
            userName,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// Get Movies By GenresID
app.get("/getMoviesByGenre/:GenresID", async (req, res) => {
    try {
        const genresId = req.params.GenresID;
        const response = await axios.get(
            `${base_url}/getMoviesByGenre/${genresId}`
        );
        const data = response.data;
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// Get DetailMovie By MovieID
app.get("/detailMovie/:MovieID", async (req, res) => {
    try {
        const movieId = req.params.MovieID;
        const response = await axios.get(`${base_url}/detailMovie/${movieId}`);
        const userName = req.session.user ? req.session.user.UserName : "";

        res.render("DetailMovie", {
            ...response.data,
            userName,
            movieId,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// Search Movie
app.get("/searchMovie", async (req, res) => {
    try {
        const searchTerm = req.query.searchTerm;
        if (!searchTerm) {
            res.redirect('/');
            return;
        }
        const response = await axios.get(`${base_url}/searchMovie?searchTerm=${searchTerm}`);
        if (response.data.movies && response.data.movies.length === 1) {
            const movieId = response.data.movies[0].MovieID;
            res.redirect(`/detailMovie/${movieId}`);
            return;
        }

        const userName = req.session.user ? req.session.user.UserName : "";
        res.render("index", {
            movies: response.data.movies,
            userName,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// Reviews Route
app.get("/reviews", async (req, res) => {
    const userName = req.session.user ? req.session.user.UserName : "";
    const movieId = req.query.movieId;
    res.render("DetailMovie", {
        userName: userName,
        movieId: movieId,
    });
});

app.post("/reviewsPost", async (req, res) => {
    try {
        const comment = req.body.comment;
        const userName = req.session.user ? req.session.user.UserName : "";
        const movieId = req.body.movieId;

        if (!userName) {
            res.redirect("/login");
            return;
        }

        await axios.post(`${base_url}/reviewsPost`, {
            comment: comment,
            userName: userName,
            movieId: movieId,
        });

        res.redirect(`/detailMovie/${movieId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

// profile User Route
app.post('/profilePost', async (req, res) => {
    try {
        const username = req.body.userName;
        const response = await axios.post(`${base_url}/profilePost`, {
            userName: username
        });

        console.log('Profile Data:', response.data);
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/updateProfile', async (req, res) => {
    try {
        const newUserName = req.body.newUserName;
        const response = await axios.post(`${base_url}/updateProfile`, {
            newUserName
        });

        console.log(response.data.message);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to update profile');
    }
});

app.get('/profile', async (req, res) => {
    try {
        const userID = req.session.user ? req.session.user.UserID : null;

        if (userID) {
            const response = await axios.post(`${base_url}/profilePost`, {
                userName: req.session.user.UserName
            });

            res.render('Profile', {
                profileData: response.data
            });
        } else {
            res.status(403).send('User not authenticated');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post("/deleteUser", async (req, res) => {
    try {
        const userName = req.body.userName || "";
        await axios.delete(`${base_url}/deleteUser`, {
            data: {
                userName,
            },
        });
        req.session.destroy();
        res.redirect("/");
    } catch (error) {
        console.error(error);
        res.status(500).send("Delete User Error");
    }
});

app.get("/editUsername", (req, res) => {
    const userName = req.session.user ? req.session.user.UserName : "";
    res.render("EditUsername", {
        userName,
        newUserName: "",
    });
});

app.get("/editEmail", (req, res) => {
    const userName = req.session.user ? req.session.user.UserName : "";
    const email = req.body.Email;
    res.render("EditEmail", {
        Email: email,
        newEmail: "",
        userName
    });
});

app.post('/updateUserName', async (req, res) => {
    const newUserName = req.body.newUserName;
    const userID = req.session.user ? req.session.user.UserID : null;

    console.log(userID);

    try {
        if (userID) {
            const response = await axios.post(base_url + '/updateUserName', {
                newUserName,
                userID
            });

            if (response.data === 'Update UserName Successfully!') {
                res.redirect('/login');
            } else {
                res.status(500).send('Failed to update UserName');
            }
        } else {
            res.status(403).send('User not authenticated');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/updateEmail', async (req, res) => {
    const newEmail = req.body.newEmail;
    const userID = req.session.user ? req.session.user.UserID : null;

    try {
        if (userID) {
            const response = await axios.post(base_url + '/updateEmail', {
                newEmail,
                userID
            });

            if (response.data === 'Update Email Successfully!') {
                res.redirect('/profile');
            } else {
                res.status(500).send('Failed to update Email');
            }
        } else {
            res.status(403).send('Email not authenticated');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Contact Route
app.get("/contact", (req, res) => {
    const userName = req.session.user ? req.session.user.UserName : "";
    res.render("Contact", {
        userName,
    });
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:5500`);
});