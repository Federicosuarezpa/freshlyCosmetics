require("dotenv").config();
const express = require("express");

const { PORT }  = process.env;

const app = express();

const {
    getOrdersInfo,
    modifyOrderState
} = require("./controllers/orders");

app.get("/getOrdersInfo", getOrdersInfo);

app.get("/modifyOrderState/:id_order", modifyOrderState);

app.use((error, req, res, next) => {
    console.error(error);
    res.status(error.httpStatus || 500).send({
        status: "error",
        message: error.message,
    });
});

app.use((req, res) => {
    res.status(404).send({
        status: "error",
        message: "Not found",
    });
});

app.listen(PORT, () => {
    console.log(`Servido activo en http://localhost:${PORT}`);
});