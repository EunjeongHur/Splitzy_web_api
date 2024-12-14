global.base_dir = __dirname;
global.abs_path = function (path) {
	return base_dir + path;
};
global.include = function (file) {
	return require(abs_path("/" + file));
};

function validatePassword(password) {
	// Minimum length of 10 characters
	if (password.length < 10) {
		return false;
	}

	// Check for at least one uppercase letter
	if (!/[A-Z]/.test(password)) {
		return false;
	}

	// Check for at least one lowercase letter
	if (!/[a-z]/.test(password)) {
		return false;
	}

	// Check for at least one digit
	if (!/\d/.test(password)) {
		return false;
	}

	// Check for at least one special character (symbol)
	if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password)) {
		return false;
	}
	return true;
}

module.exports = { validatePassword };