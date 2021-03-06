const db = require("../models/db/db");


const getAllRooms = async () => {
    const response = await db.query(`
        SELECT room_id, name, creater_id, closed, jsonb_array_length(messages) AS mescount
        FROM chatroom
    ;`);
    if(response.rows.length === 0) throw new Error('no chats found');
    return response.rows;
};

const createRoom = async (name, user) => {
    const response = await db.query(`
        INSERT INTO chatroom (name, creater_id)
        VALUES($1, $2)
        RETURNING name, creater_id, room_id;
    ;`, [name, user]);
    if(!response.rows[0]) throw new Error('chat not created');
    return response.rows[0];
};

const updateRoom = async (roomId) => {
    const response = await db.query(`
        UPDATE chatroom
        SET closed = $1
        WHERE room_id = $2
    ;`, [true, roomId]);
    if(response.rowCount !==1) throw new Error('chat not exist');
    return {message:'done'};
};

const deleteRoom = async (roomId) => {
    const response = await db.query(`
        DELETE FROM chatroom
        WHERE room_id = $1
    ;`,[roomId]);
    if(response.rowCount !== 1) throw new Error('Room not finded');
    return roomId;
};

const getMessages = async (roomId) => {
    const response = await db.query(`
        SELECT messages
        FROM chatroom
        WHERE room_id = $1
    ;`,[roomId]);
    if(response.rows[0].length === 0) throw new Error(`chat with id: ${roomId} not found`);
    return response.rows[0];
};

const createMessage = async (roomId, message) => {
    const mes = JSON.stringify(message);
    const response = await db.query(`
        UPDATE chatroom 
        SET messages = messages || $2::jsonb
        WHERE room_id = $1
        RETURNING messages
    ;`, [roomId, mes]);
    if(!response.rows) throw new Error('somthing went wrong');
    return response.rows[0];
};

const deleteMessage = async (messId) => {
    const response = await db.query(`
        WITH mes as (SELECT position -1 AS indx
            FROM chatroom,
            jsonb_array_elements(messages) 
            WITH ORDINALITY arr(elem, position)
            WHERE elem->>'messageid' = $1
        )
        UPDATE chatroom
        SET messages = messages - mes.indx::int
        FROM mes
    ;`, [messId]);
    if(response.rowCount === 0) throw new Error('messages not found');
    return response;
};

const userRegistration = async (login, password) => {
    const response = await db.query(`
        INSERT INTO chatuser (login, password)
        VALUES($1, $2)
        RETURNING login;`, [login, password]);
    if(response.rows[0].length === 0) throw new Error('user not created'); 
    return response.rows[0];
};

const signIn = async (login, password) => {
    const response = await db.query(`
    SELECT login, user_id
    FROM chatuser
    WHERE login = $1 AND password = $2;`, [login, password]);

    if(response.rows.length === 0) throw new Error('user not found');
    return response.rows[0];
};

module.exports = {
    getAllRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    getMessages,
    createMessage,
    deleteMessage,
    userRegistration,
    signIn,

};