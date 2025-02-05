const router = require("express").Router();
const auth = require("../../middlewares/auth");
const { check, validationResult } = require("express-validator");
const serverError = require("./serverError");

const User = require("../../models/User");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

// @route       POST api/posts
// @desc        Create a post
// @access      Private
router.post(
	"/",
	[auth, [check("text", "Text field is required").not().isEmpty()]],
	async (req, res) => {
		// Error check
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			// Fetch the user
			const user = await User.findById(req.user.id).select("-password");

			// Create and save the post
			const newPost = new Post({
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			});
			const post = await newPost.save();

			// Return the post
			res.json(post);
		} catch (error) {
			serverError(error, __filename);
		}
	}
);

// @route       GET /api/posts
// @desc        Get all posts
// @access      Private
router.get("/", auth, async (req, res) => {
	try {
		const posts = await Post.find().sort({ date: -1 });
		res.json(posts);
	} catch (error) {
		serverError(error, __filename);
	}
});

// @route       GET /api/posts/:post_id
// @desc        Get a single post
// @access      Private
router.get("/:post_id", auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.post_id);

		if (!post) {
			res.status(404).json({ msg: "Post not found" });
		}

		res.json(post);
	} catch (error) {
		if (error.kind == "ObjectId") {
			return res.status(404).json({ msg: "Post not found" });
		}
		serverError(error, __filename);
	}
});

// @route       DELETE /api/posts/:post_id
// @desc        Delete a post
// @access      Private
router.delete("/:post_id", auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.post_id);

		if (!post) {
			return res.status(404).json({ msg: "Post not found" });
		}

		// Check the user
		if (post.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: "User not authorized" });
		}

		await post.remove();

		res.json({ msg: "Post removed" });
	} catch (error) {
		if (error.kind == "ObjectId") {
			return res.status(404).json({ msg: "Post not found" });
		}
		serverError(error, __filename);
	}
});

// @route       PUT /api/posts/like/:post_id
// @desc        Like a post
// @access      Private
router.put("/like/:post_id", auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.post_id);

		// If post has already been liked
		if (
			post.likes.filter((like) => like.user.toString() === req.user.id).length >
			0
		) {
			return res.status(400).json({ msg: "Post already liked" });
		}

		post.likes.unshift({ user: req.user.id });

		await post.save();

		res.json(post.likes);
	} catch (error) {
		serverError(error, __filename);
	}
});

// @route       PUT /api/posts/unlike/:post_id
// @desc        Unlike a post
// @access      Private
router.put("/unlike/:post_id", auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.post_id);

		if (!post) {
			return res.status(404).json({ msg: "Post not found" });
		}
		if (
			post.likes.filter((like) => like.user.toString() === req.user.id)
				.length === 0
		) {
			return res.status(400).json({ msg: "Post has not yet been liked" });
		}

		// Get remove index
		const removeIndex = post.likes
			.map((like) => like.user.toString())
			.indexOf(req.user.id);
		post.likes.splice(removeIndex, 1);

		await post.save();

		res.json(post.likes);
	} catch (error) {
		serverError(error, __filename);
	}
});

// @route       POST /api/posts/comment/:post_id
// @desc        Comment on a post
// @access      Private
router.post(
	"/comment/:post_id",
	[auth, [check("text", "Text is required").not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.send(404).json({ errors: errors.array() });
		}

		try {
			const post = await Post.findById(req.params.post_id);
			const user = await User.findById(req.user.id).select("-password");

			const newComment = {
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			};

			post.comments.unshift(newComment);

			await post.save();

			res.json(post.comments);
		} catch (error) {
			serverError(error, __filename);
		}
	}
);

// @route       DELETE /api/posts/comment/:post_id/:comment_id
// @desc        Delete a comment
// @access      Private
router.delete("/comment/:post_id/:comment_id", auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.post_id);

		// Pull out comment out of the post
		const comment = post.comments.find(
			(comment) => comment.id === req.params.comment_id
		);

		// Check if comment exists
		if (!comment) {
			return res.status(404).json({ msg: "Comment does not exist" });
		}

		// Check user
		if (comment.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: "User not authorized" });
		}

		// Get remove index and save
		const removeIndex = post.comments
			.map((comment) => comment.user.toString())
			.indexOf(req.user.id);

		post.comments.splice(removeIndex, 1);

		await post.save();

		res.json(post.comments);
	} catch (error) {
		serverError(error, __filename);
	}
});

module.exports = router;
