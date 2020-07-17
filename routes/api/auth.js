const router = require("express").Router();
const auth = require("../../middlewares/auth");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");

const User = require("../../models/User");

// @route       GET api/auth
// @desc        Test route
// @access      Public
router.get("/", auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select("-password");
		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server error");
	}
});

// @route       POST api/auth
// @desc        Authenticate user and get token
// @access      Public
router.post(
	"/",
	[
		check("email", "Please enter a valid email").isEmail(),
		check("password", "Password is required").exists(),
	],
	async (req, res) => {
		// Validate the input fields
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: [errors.array()] });
		}

		const { email, password } = req.body;

		try {
			// Find the user
			let user = await User.findOne({ email });

			if (!user) {
				return res
					.status(404)
					.json({ errors: [{ msg: "Invalid credentials" }] });
			}

			// Match the entered password with saved password
			const isMatch = await bcrypt.compare(password, user.password);

			if (!isMatch) {
				res.status(404).json({ errors: [{ msg: "Invalid credentials" }] });
			}

			// Return JWT
			const payload = {
				user: {
					id: user.id,
				},
			};

			jwt.sign(
				payload,
				config.get("jwtSecret"),
				{ expiresIn: 360000 },
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				}
			);
		} catch (err) {
			console.error(err.message);
			res.status(500).send("Server error");
		}
	}
);

module.exports = router;
