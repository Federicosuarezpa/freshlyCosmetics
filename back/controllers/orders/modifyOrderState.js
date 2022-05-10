const getDB = require("../../dbConnection");

const modifyOrderState = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();
        const { id } = req.params;
        const { newState } = req.body;

        await connection.query(
            `
            update orders
            set current_state=?
            where id_order=?
            `,
            [newState, id]
        );
        res.send({
            status: "ok",
            message: "Estado actualizado correctamente",
        });
    } catch (error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

module.exports = modifyOrderState;