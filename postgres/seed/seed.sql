BEGIN TRANSACTION;

INSERT into users (name, email, entries, joined) values ('abc', 'abc@gmail.com', 4, '2019-01-01');
INSERT into login (hash, email) values ('asss', 'abc@gmail.com');

COMMIT;