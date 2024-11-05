import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditUser = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	useEffect(() => {
		// 加載使用者資料
		const fetchUserData = async () => {
			try {
				const token = localStorage.getItem('token');
				const response = await axios.get('/api/user', {
					headers: { Authorization: `Bearer ${token}` }
				});
				setEmail(response.data.email);
			} catch (err) {
				console.error("Error fetching user data:", err);
			}
		};

		fetchUserData();
	}, []);

	const handleUpdate = async () => {
		if (password && password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		try {
			const token = localStorage.getItem('token');
			await axios.put('/api/user', { email, password }, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setSuccess('Profile updated successfully!');
		} catch (err) {
			setError("Failed to update profile");
		}
	};

	return (
		<div>
			<h2>Edit Profile</h2>
			<input
				type="email"
				placeholder="Email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			/>
			<div>
				<input
					type={passwordVisible ? 'text' : 'password'}
					placeholder="New Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button onClick={() => setPasswordVisible(!passwordVisible)}>
					{passwordVisible ? 'Hide' : 'Show'}
				</button>
			</div>
			<input
				type="password"
				placeholder="Confirm New Password"
				value={confirmPassword}
				onChange={(e) => setConfirmPassword(e.target.value)}
			/>
			<button onClick={handleUpdate}>Update Profile</button>
			{error && <p style={{ color: 'red' }}>{error}</p>}
			{success && <p style={{ color: 'green' }}>{success}</p>}
		</div>
	);
};

export default EditUser;
