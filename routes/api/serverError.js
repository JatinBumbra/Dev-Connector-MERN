module.exports = (error, file) => {
    console.error(`${file} :  ${error.message}`);
    res.status(500).send("Server error");
}