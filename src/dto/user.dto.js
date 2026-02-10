export class UserDTO {
    constructor(user) {
        this.id = user._id?.toString() || user.id?.toString();
        this.first_name = user.first_name;
        this.last_name = user.last_name;
        this.full_name = `${user.first_name} ${user.last_name}`;
        this.email = user.email;
        this.age = user.age;
        this.role = user.role;
        this.cart = user.cart?._id?.toString() || user.cart?.toString();
        this.createdAt = user.createdAt;
        this.lastLogin = user.lastLogin;
    }
}

export class UserTokenDTO {
    constructor(user) {
        this.id = user._id?.toString() || user.id?.toString();
        this.email = user.email;
        this.role = user.role;
        this.cart = user.cart?._id?.toString() || user.cart?.toString();
    }
}