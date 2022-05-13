const getDB = require("../../dbConnection");

const numberOrders = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();
        const [numberOrders] = await connection.query(
            `
            select count(id_order) as numberOrders
            from orders
            `
        );
        console.log(numberOrders)
        res.send({
            status: "ok",
            message: numberOrders,
        });
    } catch (error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

module.exports = numberOrders;