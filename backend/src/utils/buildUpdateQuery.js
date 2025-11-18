export const buildUpdateQuery = (tableName, data, where) => {
    const keys = Object.keys(data);

    if (keys.length === 0) {
        return { sql: null, values: [] };
    }

    let sql = `UPDATE ${tableName} SET `;
    const values = [];

    keys.forEach((key, index) => {
        sql += `${key} = ?`;
        if (index < keys.length - 1) sql += ", ";
        values.push(data[key]);
    });

    sql += " WHERE ";
    const whereKeys = Object.keys(where);

    whereKeys.forEach((key, index) => {
        sql += `${key} = ?`;
        if (index < whereKeys.length - 1) sql += " AND ";
        values.push(where[key]);
    });

    return { sql, values };
};
