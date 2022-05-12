const getDB = require("../../dbConnection");

const countriesInfo = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();
        const [countries] = await connection.query(
            `
            select id_country, name as country
            from country_lang
            `
        );
        res.send({
            status: "ok",
            message: countries,
        });
    } catch (error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

module.exports = countriesInfo;