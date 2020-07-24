import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Moment from "react-moment";
import { addLike, unlike, deletePost } from "../../actions/post";
import { connect } from "react-redux";

const PostItem = ({
	auth,
	post: { _id, text, name, avatar, user, likes, comments, date },
	showActions,
}) => {
	return (
		<div className="post bg-white p-1 my-1">
			<div>
				<Link to={`/profile/${user}`}>
					<img className="round-img" src={avatar} alt="" />
				</Link>
				<h4>{name}</h4>
			</div>

			<div>
				<p className="my-1">{text}</p>
				<p className="post-date">
					Posted on <Moment format="YYYY/MM/DD">{date}</Moment>{" "}
				</p>
				{showActions && (
					<Fragment>
						<button
							className="btn"
							onClick={(e) => {
								addLike(_id);
								console.log("addLike from PostItem", _id);
							}}
						>
							<i className="fas fa-thumbs-up"></i>{" "}
							{likes.length > 0 && <span>{likes.length}</span>}{" "}
						</button>
						<button
							className="btn"
							onClick={(e) => {
								unlike(_id);
								console.log("unlike from PostItem", _id);
							}}
						>
							<i className="fas fa-thumbs-down"></i> <span></span>{" "}
						</button>
						<Link to={`/post/${_id}`} className="btn btn-primary">
							Discussion{" "}
							{comments.length > 0 && (
								<span className="comment-count">{comments.length}</span>
							)}
						</Link>
						{!auth.loading && user === auth.user._id && (
							<button
								className="btn btn-danger"
								type="button"
								onClick={() => deletePost(_id)}
							>
								<i className="fas fa-times"></i>
							</button>
						)}
					</Fragment>
				)}
			</div>
		</div>
	);
};

PostItem.defaultProps = {
	showActions: true,
};

PostItem.propTypes = {
	post: PropTypes.object.isRequired,
	auth: PropTypes.object.isRequired,
	addLike: PropTypes.func.isRequired,
	unlike: PropTypes.func.isRequired,
	deletePost: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
	auth: state.auth,
});

export default connect(mapStateToProps, { addLike, unlike, deletePost })(
	PostItem
);
