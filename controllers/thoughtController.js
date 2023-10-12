const {Thought, User} = require('../models');

// Aggregate function to get the number of reactions on Thought
const reactionCount = async () =>
	Thought.aggregate()
		.count('reactionCount')
		.then((numberOfReactions) => numberOfReactions);

module.exports = {
	// GET all thoughts
	getThoughts(req, res) {
		Thought.find()
			.then(async (thoughts) => {
				const thoughtsObj = {
					thoughts,
					reactionCount: await reactionCount(),
				};
				res.json(thoughtsObj);
			})
			.catch((err) => {
				console.log(err);
				return res.status(500).json(err);
			});
	},

	// GET a single thought by _id
	getSingleThought(req, res) {
		Thought.findOne({_id: req.params.thoughtId})
			.select('-__v')
			.then((thought) =>
				!thought
					? res.status(404).json({message: 'No thought with that ID'})
					: res.json(thought)
			)
			.catch((err) => {
				console.log(err);
				return res.status(500).json(err);
			});
	},

	// POST Create a thought and pushes the created thought's _id to the associated user's thoughts array field
	createThought(req, res) {
		Thought.create(req.body)
			.then((thought) => {
				return User.findOneAndUpdate(
					{_id: req.body.userId},
					{$addToSet: {thoughts: thought._id}},
					{new: true}
				);
			})
			.then((user) =>
				!user
					? res.status(404).json({
							message: 'Thought created, but found no user with that ID',
					  })
					: res.json('Created the thought 💭')
			)
			.catch((err) => {
				console.log(err);
				return res.status(500).json(err);
			});
	},

	// PUT update a thought by _id
	updateThought(req, res) {
		Thought.findOneAndUpdate(
			{_id: req.params.thoughtId},
			{$set: req.body},
			{runValidators: true, new: true}
		)
			.then((thought) =>
				!thought
					? res.status(404).json({message: 'No thought with this id!'})
					: res.json(thought)
			)
			.catch((err) => {
				console.log(err);
				return res.status(500).json(err);
			});
	},

	// DELETE a thought by _id
	deleteThought(req, res) {
		Thought.findOneAndDelete({_id: req.params.thoughtId})
			.then((thought) =>
				!thought
					? res.status(404).json({message: 'No thought with that ID'})
					: res.json({message: 'Thought deleted!'})
			)
			.catch((err) => {
				console.log(err);
				return res.status(500).json(err);
			});
	},

	// POST Add an reaction to a thought
	addReaction(req, res) {
		('You are adding a reaction');
		Thought.findOneAndUpdate(
			{_id: req.params.thoughtId},
			{$addToSet: {reactions: req.body}},
			{runValidators: true, new: true}
		)
			.then((thought) =>
				!thought
					? res.status(404).json({
							message: 'No thought found with that ID :(',
					  })
					: res.json(thought)
			)
			.catch((err) => {
				console.log(err);
				return res.status(500).json(err);
			});
	},

	// DELETE Remove reaction from a thought
	removeReaction(req, res) {
		Thought.findOneAndUpdate(
			{_id: req.params.thoughtId},
			{$pull: {reactions: {reactionId: req.params.reactionId}}},
			{new: true}
		)
			.then((thought) =>
				!thought
					? res.status(404).json({
							message: 'No thought found with that ID :(',
					  })
					: res.json(thought)
			)
			.catch((err) => {
				console.log(err);
				return res.status(500).json(err);
			});
	},
};