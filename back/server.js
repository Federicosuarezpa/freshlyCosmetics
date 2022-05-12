require("dotenv").config();
const cors=require("cors");
const express = require("express");

const { PORT }  = process.env;
const app = express();
const corsOptions ={
    origin:'*',
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
}

const {
    getOrdersInfo,
    modifyOrderState,
    getCountries,
    getNumberOrders,
    getOrderInfo
} = require("./controllers/orders");

app.use(cors(corsOptions))

app.get("/getOrdersInfo", getOrdersInfo);
app.put("/modifyOrderState/:id_order", modifyOrderState);
app.get("/getCountries", getCountries);
app.get("/getNumberOrders", getNumberOrders);
app.get("/getOrderInfo/:id_order", getOrderInfo);

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