import React, { Fragment, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { login } from "../../actions/auth";

const Login = ({ login, isAuthenticated }) => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const { email, password } = formData;

	const onChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const onSubmit = (e) => {
		e.preventDefault();
		login(email, password);
	};

	if (isAuthenticated) {
		return <Redirect to="/dashboard" />;
	}

	return (
		<Fragment>
			<h1 className="large text-primary">Sign In</h1>
			<p className="lead">
				<i className="fas fa-user"></i> Sign into your Account
			</p>
			<form onSubmit={(e) => onSubmit(e)} className="form">
				<div className="form-group">
					<input
						type="email"
						name="email"
						value={email}
						onChange={(e) => onChange(e)}
						placeholder="Email Address"
					/>
				</div>
				<div className="form-group">
					<input
						type="password"
						name="password"
						value={password}
						onChange={(e) => onChange(e)}
						placeholder="Password"
						min-length="6"
					/>
				</div>
				<input type="submit" value="Login" className="btn btn-primary" />
			</form>
			<p className="my-1">
				Don't have an account? <Link to="/register"> Sign Up</Link>
			</p>
		</Fragment>
	);
};

Login.propTypes = {
	login: PropTypes.func.isRequired,
	isAuthenticated: PropTypes.bool,
};

const mapStateToProps = (state) => ({
	isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { login })(Login);
