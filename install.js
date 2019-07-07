var load = require('./bin/www');
var Role = require('./models/role');

let userRoles = [
	{name: 'Admin'},
	{name: 'User'}
];

return load().then(() => {
	return run().then(result => {
		console.log(result);
		process.exit();
	}).catch(err => {
		console.log(err)
		process.exit();
	})
}).catch(err => {
	console.log(err);
	process.exit();
})

function run () {
	return new Promise(function(resolve, reject) {
		return createRoles().then(roles => {
            return resolve({roles});
		}).catch((err) => { return reject(err); });
	})
}

function createRoles() {
	return new Promise(function(resolve, reject) {
		return Role.create(userRoles).then(roles => {
			return resolve(roles);
		}).catch(err => {
			return reject(err);
		})
	})
}