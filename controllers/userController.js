const {ObjectId} = require('mongoose').Types;
const {User, Thought} = require('../models');

// Aggregate function to get the number of users friends
const friendCount = async () =>
	User.aggregate()
		.count('friendCount')
		.then((numberOfFriends) => numberOfFriends);

// ** Need to come back to this function below and finish it! (getSingleUser)
// Aggregate function for getting populated thought and friend data
const getThoughtsAndFriends = async (userId) =>
	User.aggregate([
		// only include the given user by using $match to match the user Id
		{$match: {_id: ObjectId(userId)}},
		{
			$unwind: '$thoughts',
		},
		{
			$group: {
				_id: ObjectId(null),
				overallGrade: {$avg: '$thoughts.score'},
			},
		},
	]);

module.exports = {
	// GET all users
	getUsers(req, res) {
		User.find()
			.then(async (users) => {
				const userObj = {
					users,
					friendCount: await friendCount(), // retrieves the length of the users friends array.
				};
				return res.json(userObj);
			})
			.catch((err) => {
				console.log(err);
				return res.status(500).json(err);
			});
	},
	// GET a single userby its _id and populated thought and friend data
	// **Need to come back to the populate thoughts and frineds data part of this API call function.
	// ONLY HAVE THOUGHTS AND NOT FRIENDS ATM>
	getSingleUser(req, res) {
		User.findOne({_id: req.params.userId})
			.populate({path: 'thoughts', select: '-__v'})
			.select('-__v')
			.then(async (user) =>
				!user
					? res.status(404).json({message: 'No user with that ID'})
					: res.json({
							user,
					  })
			)
			.catch((err) => {
				console.log(err);
				return res.status(500).json(err);
			});
	},

	// POST create a new user
	createUser(req, res) {
		User.create(req.body)
			.then((user) => res.json(user))
			.catch((err) => {
				console.log(err);
				return res.status(500).json(err);
			});
	},

	// PUT update a user by its _id
	updateUser(req, res) {
		User.findOneAndUpdate(
			{_id: req.params.userId},
			{$set: req.body},
			{runValidators: true, new: true}
		)
			.then((user) =>
				!user
					? res.status(404).json({message: 'No user with this id!'})
					: res.json(user)
			)
			.catch((err) => {
				console.log(err);
				return res.status(500).json(err);
			});
	},

	// Delete a user and remove the associated thoughts
	deleteUser(req, res) {
		User.findOneAndRemove({_id: req.params.userId})
			.then((user) =>
				!user
					? res.status(404).json({message: 'No such user exists'})
					: Thought.findOneAndUpdate(
							{users: req.params.userId},
							{$pull: {users: req.params.userId}},
							{new: true}
					  )
			)
			.then((user) =>
				!user
					? res.status(404).json({
							message: 'User deleted, but no thoughts found',
					  })
					: res.json({message: 'User successfully deleted'})
			)
			.catch((err) => {
				console.log(err);
				return res.status(500).json(err);
			});
	},

	// Add an friend to a user
	addFriend(req, res) {
		console.log('You are adding a friend');
		User.findOneAndUpdate(
			{_id: req.params.userId},
			{$addToSet: {friends: req.params.friendId}},
			{runValidators: true, new: true}
		)
			.then((user) =>
				!user
					? res.status(404).json({
							message: 'No user found with that ID :(',
					  })
					: res.json(user)
			)
			.catch((err) => {
				console.log(err);
				return res.status(500).json(err);
			});
	},

	// Remove friend from a user
	removeFriend(req, res) {
		User.findOneAndUpdate(
			{_id: req.params.userId},
			{
				$pull: {
					friend: {friendId: req.params.friendId},
				},
			},
			{runValidators: true, new: true}
		)
			.then((user) =>
				!user
					? res.status(404).json({
							message: 'No user found with that ID :(',
					  })
					: res.json(user)
			)
			.catch((err) => {
				console.log(err);
				return res.status(500).json(err);
			});
	},
};