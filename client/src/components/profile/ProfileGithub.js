import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getGithubRepos } from "../../actions/profile";
import Spinner from "../layout/Spinner";

const ProfileGithub = ({ username, getGithubRepos, repos }) => {
	useEffect(() => {
		getGithubRepos(username);
	}, [getGithubRepos, username]);

	return (
		<div className="profile-github">
			<h2 className="text-primary my-1">GitHub repositories</h2>
			{repos === null ? (
				<Spinner />
			) : (
				repos.map((repo, index) => (
					<div className="repo bg-white my-1 p-1" key={repo._id}>
						<div>
							<h4>
								<a
									href={repo.html_url}
									target="_blank"
									rel="noopener noreferrer"
								>
									{repo.name}
								</a>
							</h4>
							<p>{repo.description}</p>
						</div>

						<div>
							<ul>
								<li key={index + 1} className="badge badge-primary">
									Stars : {repo.stargazers_count}
								</li>
								<li key={(index + 1) * 2} className="badge badge-dark">
									Watchers : {repo.watchers_count}
								</li>
								<li key={(index + 1) * 3} className="badge badge-light">
									Forks : {repo.forks_count}
								</li>
							</ul>
						</div>
					</div>
				))
			)}
		</div>
	);
};

ProfileGithub.propTypes = {
	getGithubRepos: PropTypes.func.isRequired,
	repos: PropTypes.array.isRequired,
	username: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
	repos: state.profile.repos,
});

export default connect(mapStateToProps, { getGithubRepos })(ProfileGithub);
