import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [passwordVisible, setPasswordVisible] = useState(false);

	const handleRegister = async () => {
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		try {
			const response = await axios.post('/api/register', { email, password });
			localStorage.setItem('token', response.data.token);
			alert('Registration successful!');
		} catch (err) {
			setError('Email is already registered');
		}
	};

	return (
		<div>
			<h2>Register</h2>
			<input
				type="email"
				placeholder="Email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			/>
			<div>
				<input
					type={passwordVisible ? 'text' : 'password'}
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button onClick={() => setPasswordVisible(!passwordVisible)}>
					{passwordVisible ? 'Hide' : 'Show'}
				</button>
			</div>
			<input
				type="password"
				placeholder="Confirm Password"
				value={confirmPassword}
				onChange={(e) => setConfirmPassword(e.target.value)}
			/>
			<button onClick={handleRegister}>Register</button>
			{error && <p style={{ color: 'red' }}>{error}</p>}
		</div>
	);
};

export default Register;
