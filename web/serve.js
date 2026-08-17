import express from "express";
import path from "path";
const app = express();

app.use(express.static(path.join("./build/client")));

// For any unknown paths, serve the index.html file
app.get(function (req, res) {
    res.sendFile(path.join("./build/client/index.html"));
});

app.listen(3000);
