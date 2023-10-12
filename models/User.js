const {Schema, model} = require('mongoose');
const thoughtSchema = require('./Thought');

const validateEmail = (email) => {
	const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	return re.test(email);
};

// Schema to create User model
const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		email: {
			type: String,
			required: 'Email address is required',
			unique: true,
			validate: [validateEmail, 'Please fill a valid email address'],
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				'Please fill a valid email address',
			],
		},
		thoughts: [
			{
				type: Schema.Types.ObjectId,
				ref: 'thought',
			},
		],
		friends: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
		],
	},
	{
		toJSON: {
			getters: true,
		},
	}
);

const User = model('user', userSchema);

module.exports = User;