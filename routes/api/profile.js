const router = require("express").Router();
const auth = require("../../middlewares/auth");
const request = require("request");
const config = require("config");
const { check, validationResult } = require("express-validator");
const serverError = require("./serverError");

const Profile = require("../../models/Profile");
const User = require("../../models/User");
const Post = require("../../models/Post");

// @route       GET api/profile/me
// @desc        Get current user's profile
// @access      Private
router.get("/me", auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.user.id,
		}).populate("user", ["name", "avatar"]);

		if (!profile) {
			return res.status(400).json({ msg: "There is no profile for this user" });
		}

		res.json(profile);
	} catch (error) {
		serverError(error, __filename);
	}
});

// @route       POST api/profile
// @desc        Create or update a user profile
// @access      Private
router.post(
	"/",
	[
		auth,
		[
			check("status", "Status is required").not().isEmpty(),
			check("skills", "Skills is required").not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			res.status(400).json({ errors: errors.array() });
		}

		// Fetch the profile data from request body
		const {
			company,
			website,
			location,
			bio,
			status,
			githubusername,
			skills,
			youtube,
			instagram,
			facebook,
			twitter,
			linkedin,
		} = req.body;

		// Build profile object
		const profileFields = {};
		profileFields.user = req.user.id;
		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		if (githubusername) profileFields.githubusername = githubusername;
		if (skills)
			profileFields.skills = skills.split(",").map((skill) => skill.trim());

		// Build social object
		profileFields.social = {};
		if (youtube) profileFields.social.youtube = youtube;
		if (instagram) profileFields.social.instagram = instagram;
		if (facebook) profileFields.social.facebook = facebook;
		if (twitter) profileFields.social.twitter = twitter;
		if (linkedin) profileFields.social.linkedin = linkedin;

		// Update profile or create new one
		try {
			let profile = await Profile.findOne({ user: req.user.id });

			// Update
			if (profile) {
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				);

				return res.json(profile);
			}

			// Create
			profile = new Profile(profileFields);

			await profile.save();
			res.json(profile);
		} catch (error) {
			serverError(error, __filename);
		}
	}
);

// @route       GET api/profile
// @desc        Get all profiles
// @access      Public
router.get("/", async (req, res) => {
	try {
		const profiles = await Profile.find().populate("user", ["name", "avatar"]);
		res.json(profiles);
	} catch (error) {
		serverError(error, __filename);
	}
});

// @route       GET api/profile/user/:user_id
// @desc        Get profile by user id
// @access      Public
router.get("/user/:user_id", async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id,
		}).populate("user", ["name", "avatar"]);

		if (!profile) {
			res.status(400).json({ msg: "There is no profile for this user" });
		}

		res.json(profile);
	} catch (error) {
		if (error.kind == "ObjectId") {
			return res.status(400).json({ msg: "There is no profile for this user" });
		}
		serverError(error, __filename);
	}
});

// @route       DELETE api/profile
// @desc        Delete profile, user and posts
// @access      Private
router.delete("/", auth, async (req, res) => {
	try {
		// Remove user posts
		await Post.deleteMany({ user: req.user.id });
		// Remove profile
		await Profile.findOneAndRemove({ user: req.user.id });
		// Remove user
		await User.findOneAndRemove({ _id: req.user.id });

		res.json({ msg: "User deleted" });
	} catch (error) {
		serverError(error, __filename);
	}
});

// @route       PUT api/profile/experience
// @desc        Add profile experience
// @access      Private
router.put(
	"/experience",
	[
		auth,
		[
			check("title", "Title is required").not().isEmpty(),
			check("company", "Company is required").not().isEmpty(),
			check("from", "From date is required").not().isEmpty(),
		],
	],
	async (req, res) => {
		// Check for any errors
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		// Fetch data from request body
		const {
			title,
			company,
			location,
			to,
			from,
			description,
			current,
		} = req.body;

		const newExp = {
			title,
			company,
			location,
			to,
			from,
			current,
			description,
		};

		// Save the experience to database
		try {
			const profile = await Profile.findOne({ user: req.user.id });

			profile.experience.unshift(newExp);

			await profile.save();

			res.json(profile);
		} catch (error) {
			serverError(error, __filename);
		}
	}
);

// @route       DELETE api/profile/experience/:exp_id
// @desc        Delete profile experience
// @access      Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
	try {
		// Fetch the profile
		const profile = await Profile.findOne({ user: req.user.id });

		// Get index of experience to be removed
		const removeIndex = profile.experience
			.map((item) => item.id)
			.indexOf(req.params.exp_id);

		// Remove that experience from the experience array
		profile.experience.splice(removeIndex, 1);

		// Save the profile
		await profile.save();

		// Send back the response
		res.json(profile);
	} catch (error) {
		serverError(error, __filename);
	}
});

// @route       PUT /api/profile/education
// @desc        Add user education
// @access      Private
router.put(
	"/education",
	[
		auth,
		[
			check("school", "School is required").not().isEmpty(),
			check("degree", "Degree is required").not().isEmpty(),
			check("fieldofstudy", "Field of study is required").not().isEmpty(),
			check("from", "From date is required").not().isEmpty(),
		],
	],
	async (req, res) => {
		// Check for errors
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		// Fetch data from request body
		const {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description,
		} = req.body;

		const newEdu = {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description,
		};

		// Save education to user profile
		try {
			const profile = await Profile.findOne({ user: req.user.id });

			profile.education.unshift(newEdu);

			await profile.save();

			res.json(profile);
		} catch (error) {
			serverError(error, __filename);
		}
	}
);

// @route       DELETE api/profile/education/:edu_id
// @desc        Delete profile education
// @access      Private
router.delete("/education/:edu_id", auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		const removeIndex = profile.education
			.map((item) => item._id)
			.indexOf(req.params.edu_id);

		profile.education.splice(removeIndex, 1);

		await profile.save();

		res.json(profile);
	} catch (error) {
		serverError(error, __filename);
	}
});

// @route       GET api/profile/github/:username
// @desc        Get user repositories from Github
// @access      Public
router.get("/github/:username", (req, res) => {
	try {
		const options = {
			uri: `https://api.github.com/users/${
				req.params.username
			}/repos?per_page=5&sort=created:asc&client_id=${config.get(
				"githubClientId"
			)}&client_secret=${config.get("githubClientSecret")}`,
			method: "GET",
			headers: { "user-agent": "node.js" },
		};

		request(options, (error, response, body) => {
			if (error) console.error(error);

			if (response.statusCode !== 200) {
				return res.status(404).json({ msg: "No Github profile found" });
			}

			res.json(JSON.parse(body));
		});
	} catch (error) {
		serverError(error, __filename);
	}
});

module.exports = router;
