CREATE TABLE chatuser (
	user_id serial PRIMARY KEY,
	login VARCHAR(60) UNIQUE,
	password VARCHAR(60)
);

CREATE TABLE chatroom (
	room_id SERIAL PRIMARY KEY,
	name VARCHAR(25) UNIQUE,
	closed BOOLEAN DEFAULT false,
	creater_id INT REFERENCES chatuser(user_id),
	messages JSONB NOT NULL DEFAULT '[]'
);