const getDB = require("../../dbConnection");

const orderInfo = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();
        const { id_order } = req.params;
        console.log(id_order)

        const [order] = await connection.query(
            `
            select o.id_order, date_add, firstname, lastname, address1, address2, 
                    cl.name as country, product_name, osl.name as current_state_name, o.current_state as current_state
            from orders o, address ad, order_detail od, order_state_lang osl, country_lang cl
            where o.id_address_delivery = ad.id_address 
            and o.id_order = od.id_order_detail 
            and o.current_state = osl.id_order_state
            and cl.id_country = ad.id_country
            and o.id_order = ?
            `,
            [id_order]
        );
        res.send({
            status: "ok",
            message: order,
        });
    } catch (error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

module.exports = orderInfo;