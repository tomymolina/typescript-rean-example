'use strict';
var crypto = require('crypto');
var db_1 = require('../../config/db');
var thinky = db_1.default.getInstance().getThinky();
var r = thinky.r, type = thinky.type;
function validateLocalStrategyProperty(property) {
    return ((this.provider !== 'local' && !this.updated) || property.length);
}
function validateLocalStrategyPassword(password) {
    return (this.provider !== 'local' || (password && password.length > 6));
}
var User = thinky.createModel('users', {
    id: type.string(),
    firstName: type.string().validator(validateLocalStrategyProperty).default(''),
    lastName: type.string().validator(validateLocalStrategyProperty).default(''),
    displayName: type.string(),
    email: type.string().email().required(),
    username: type.string().required(),
    password: type.string().validator(validateLocalStrategyPassword),
    salt: type.string(),
    provider: type.string(),
    providerData: type.object(),
    additionalProvidersData: type.object(),
    roles: type.array().schema(type.string().enum('user', 'admin')).default(['user']).required(),
    updated: type.date().optional().allowNull().default(function () { return new Date(); }),
    created: type.date().optional().allowNull().default(function () { return new Date(); }),
    resetPasswordToken: type.string(),
    resetPasswordExpires: type.date()
}, {
    enforce_extra: 'remove'
});
User.ensureIndex('username');
User.ensureIndex('email');
User.pre('save', function (next) {
    var self = this;
    if (self.password && self.password.length > 6) {
        self.salt = (new Buffer(crypto.randomBytes(16).toString('base64'), 'base64')).toString();
        self.password = self.hashPassword(self.password);
    }
    next();
});
User.define('hashPassword', function (password) {
    var self = this;
    if (self.salt && password) {
        return crypto.pbkdf2Sync(password, self.salt, 10000, 64).toString('base64');
    }
    else {
        return password;
    }
});
User.define('authenticate', function (password) {
    var self = this;
    return self.password === self.hashPassword(password);
});
User.defineStatic('findUniqueUsername', function (username, suffix, callback) {
    var _this = this;
    var possibleUsername = username + (suffix || '');
    return _this.getByUsername(possibleUsername)
        .run()
        .then(function (user) { return _this.findUniqueUsername(username, (suffix || 0) + 1, callback); }, function (err) {
        if (typeof callback === 'function') {
            callback(possibleUsername);
        }
        return possibleUsername;
    });
});
User.defineStatic('getByUsername', function (username) {
    var self = this;
    return self.getAll(username, { index: 'username' })
        .limit(1)
        .nth(0);
});
User.defineStatic('getByEmail', function (email) {
    var self = this;
    return self.getAll(email, { index: 'email' })
        .limit(1)
        .nth(0);
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = User;
//# sourceMappingURL=user.server.model.js.map