const getDB = require("../../dbConnection");

const ordersInfo = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();
        const [orders] = await connection.query(
            `
            select o.id_order, date_add, firstname, lastname, address1, address2, city, product_name, name
            from orders o, address ad, order_detail od, order_state_lang osl
            where o.id_address_delivery = ad.id_address 
            and o.id_order = od.id_order_detail 
            and o.current_state = osl.id_order_state
            `
        );
        res.send({
            status: "ok",
            message: orders,
        });
    } catch (error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

module.exports = ordersInfo;