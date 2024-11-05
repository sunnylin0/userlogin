import sqlite3 from "sqlite3";

export default async function seedDatabase() {
    const promise = new Promise((resolve, reject) => {
        const db = new sqlite3.Database('../database/myapp.sqlite3', async (err) => {
            if (err) {
                console.error(err);
            } else {
                try {
					await dropUsers(db);
					await createUsers(db);
					await createPhotos(db);
                    await insertUsers(db, "master", "Master Account", "hardpassword");
                    await showUsers(db);
                    resolve(true);
                } catch (err) {
                    console.error(err);
                    reject(false);
                }
            }
        });
    });
    return promise;
}

//seedDatabase();

async function dropUsers(db) {
    const promise = new Promise((resolve, reject) => {
        db.run("DROP TABLE IF EXISTS users;", [], (err) => {
            if (err) {
                console.error(err);
                reject();
            } else
                resolve();
        });
    });
    return promise;
}

async function createUsers(db) {
	const promise = new Promise((resolve, reject) => {
		const sql = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY ,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
);`

		db.run(sql, [], (err) => {
			if (err) {
				console.error(err);
				reject();
			} else
				resolve();
		});
	});
	return promise;
}

async function createPhotos(db) {
	const promise = new Promise((resolve, reject) => {
		const sql = `CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY ,
    userId INTEGER,
    photoPath TEXT,
    is_primary INTEGER DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES users(id)
);`

		db.run(sql, [], (err) => {
			if (err) {
				console.error(err);
				reject();
			} else
				resolve();
		});
	});
	return promise;
}

async function insertUsers(db, id, name, passowrd) {
    const promise = new Promise((resolve, reject) => {
        db.run("INSERT INTO users(id, name, password) VALUES(?, ?, ?);", [id, name, passowrd], (err) => {
            if (err) {
                console.error(err);
                reject();
            } else
                resolve();
        });
    });
    return promise;
}

async function showUsers(db) {
    const promise = new Promise((resolve, reject) => {
        db.all("SELECT * FROM users", (err, rows) => {
            if (rows && err == null) {
                console.log(rows);
                resolve();
            } else {
                console.error(err);
                reject();
            }
        });
    });
    return promise;
}