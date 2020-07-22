import React from "react";
import { Link, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";

const Landing = ({ isAuthenticated }) => {
	if (isAuthenticated) {
		return <Redirect to="/dashboard" />;
	}

	return (
		<section className="landing">
			<div className="dark-overlay">
				<div className="landing-inner">
					<h1 className="x-large">
						Developer <span className="text-primary">Connector</span>{" "}
					</h1>
					<p className="lead">
						Create Developer Profile/Protfolio, share posts and get help from
						other developers
					</p>
					<div className="buttons">
						<Link to="/register" className="btn btn-primary">
							Register
						</Link>
						<Link to="/login" className="btn">
							Login
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
};

Landing.propTypes = {
	isAuthenticated: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
	isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(Landing);
