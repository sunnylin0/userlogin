import express from 'express';
import sqlite3 from 'sqlite3';
import {v4 as uuidvs} from 'uuid';
import seedDatabase from './seedDatabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import nodemailer from 'nodemailer';
//import path from 'path';
//import fs from 'fs';


//const express = require('express');
//const sqlite3 = require('sqlite3').verbose();
//const bcrypt = require('bcrypt');
//const jwt = require('jsonwebtoken');
//const multer = require('multer');  // For handling file uploads
//const path = require('path');
//const fs = require('fs');

// ��l�� SQLite ��Ʈw
await seedDatabase();

const DB_PATH = '../database/myapp.sqlite3'
const app = express();
const port = 8080;
const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
}

const SECRET_KEY = 'your_secret_key';


app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

app.get("/health", (req, res) => {
    console.log("Health check endpoint is reached");
    res.send("Healthy");
});

app.get("/hello", (req, res) => {
    console.log("GET Hello World");
    console.log("Body:", req.body);
    res.set(headers);

	const db = new sqlite3.Database(DB_PATH, async (err) => {
        if (err)
            console.error(err);
        else {
            db.all("SELECT * FROM users;", [], (err, rows) => {
                if (rows && err == null) {
                    res.send({message: "Hello World from backend", rows: rows});
                }
            });
        }
    });
});

app.options("/hello", (req, res) => {
    res.set(headers);
    res.send("preflight response");
});

const logger = (req, res, next) => {
    console.log("Unexpected path:", req.url);
    next();
}

app.use(logger);

const server = app.listen(port, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});

async function closeGracefully(signal) {
    console.log(`Received termated signal: ${signal}; process terminated...`);
    await server.close();
    process.exit();
}
process.on("SIGINT", closeGracefully);
process.on("SIGTERM", closeGracefully);

//   GTP �g

//const app = express();
//const PORT = 3000;
//const SECRET_KEY = 'your_secret_key';

//// ��l�� SQLite ��Ʈw
//const db = new sqlite3.Database(DB_PATH, (err) => {
//	if (err) console.error('Database connection error:', err.message);
//});

// �����h
//app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images statically

// Multer �]�w
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, './uploads');
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`);
	}
});
const upload = multer({ storage });

// ���ҥΤᨭ���������h
const authenticateToken = (req, res, next) => {
	const token = req.headers['authorization']?.split(' ')[1];
	if (!token) return res.sendStatus(401);
	jwt.verify(token, SECRET_KEY, (err, user) => {
		if (err) return res.sendStatus(403);
		req.user = user;
		next();
	});
};

// �s�W�W�ǻP��s�Τ�Ϥ�������
app.put('/api/user/avatar', authenticateToken, upload.single('avatar'), (req, res) => {
	const userId = req.user.id;
	const avatarPath = `/uploads/${req.file.filename}`;

	db.run(
		'UPDATE users SET avatar = ? WHERE id = ?',
		[avatarPath, userId],
		function (err) {
			if (err) return res.status(500).json({ message: 'Failed to update avatar' });
			res.json({ message: 'Avatar updated successfully', avatar: avatarPath });
		}
	);
});

// ���U����
app.post('/api/register', async (req, res) => {
	const { email, password } = req.body;

	// �N�K�X�[�K
	try {
		const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
		db.run(
			'INSERT INTO users (email, passwordHash) VALUES (?, ?)',
			[email, hashedPassword],
			function (err) {
				if (err) return res.status(400).json({ message: 'Email already registered' });

				const token = jwt.sign({ id: this.lastID, email }, SECRET_KEY);
				res.json({ token });
			}
		);
	} catch (err) {
		res.status(500).json({ message: 'Error during registration' });
	}
});

// �n�J����
app.post('/api/login', (req, res) => {
	const { email, password } = req.body;

	db.get('SELECT id, passwordHash FROM users WHERE email = ?', [email], async (err, user) => {
		if (err || !user) return res.status(400).json({ message: 'Invalid email or password' });

		// ���ұK�X�O�_���T
		const validPassword = await bcrypt.compare(password, user.passwordHash);
		if (!validPassword) return res.status(400).json({ message: 'Invalid email or password' });

		const token = jwt.sign({ id: user.id, email }, SECRET_KEY);
		res.json({ token });
	});
});

// PUT /api/user - �ק�ϥΪ̸�T
app.put('/api/user', authenticateToken, async (req, res) => {
	const { email, password } = req.body;

	let passwordHash;
	if (password) {
		passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
	}

	db.run(
		'UPDATE users SET email = ?, passwordHash = COALESCE(?, passwordHash) WHERE id = ?',
		[email, passwordHash, req.user.id],
		function (err) {
			if (err) return res.status(500).json({ message: 'Failed to update profile' });
			res.json({ message: 'Profile updated successfully' });
		}
	);
});

//// �Ұʦ��A��
//app.listen(PORT, () => {
//	console.log(`Server running on http://localhost:${PORT}`);
//});
