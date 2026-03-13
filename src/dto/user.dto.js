export class UserDTO {
    constructor(user) {
        this.id = user._id;
        this.email = user.email;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.role = user.role;
        this.cart = user.cart;
        this.createdAt = user.createdAt;
    }
}

export class UserPublicDTO {
    constructor(user) {
        this.id = user._id;
        this.email = user.email;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.role = user.role;
    }
}

export class UserRegisterDTO {
    constructor(data) {
        this.email = data.email;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.password = data.password;
    }
}