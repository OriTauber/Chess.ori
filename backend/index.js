const express = require('express')
const path = require('path')
const app = express();



app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('/', (req, res) => {
    res.send("Hi")
})

app.listen(5000, () => {
    console.log("Listening on port 5000!")
})