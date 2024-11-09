//Imports
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv"); //For using process.env
const app = express();
const PORT = 8080;
const authRoutes = require("./Routes/AuthRoute")
const path = require("path");


//Configurations
// dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });  // Adjust the path based on your structure
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const dirname = path.resolve();


//Database
mongoose.set('strictQuery', false);

const mongoURL = `mongodb+srv://admin:${process.env.MONGO_DB_PASSWORD}@cluster0.1vudx.mongodb.net/Project?retryWrites=true&w=majority&appName=Cluster0`
mongoose.connect(mongoURL)
    .then(() => {
        console.log("Database connected");
    }).catch((error) => {
        console.log(error);
    });

//Routes
app.use("/user", authRoutes);


app.use(express.static(path.join(dirname, '/client/dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(dirname, 'client', 'dist', 'index.html'));
})

app.listen(PORT, () => {
    console.log(`Server running at PORT - ${PORT}`);
});