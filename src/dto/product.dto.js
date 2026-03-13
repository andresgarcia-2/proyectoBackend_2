export class ProductDTO {
    constructor(product) {
        this.id = product._id;
        this.title = product.title;
        this.description = product.description;
        this.price = product.price;
        this.thumbnail = product.thumbnail;
        this.code = product.code;
        this.stock = product.stock;
        this.category = product.category;
        this.status = product.status;
    }
}

export class ProductCreateDTO {
    constructor(data) {
        this.title = data.title;
        this.description = data.description;
        this.price = data.price;
        this.thumbnail = data.thumbnail;
        this.code = data.code;
        this.stock = data.stock;
        this.category = data.category;
        this.status = data.status ?? true;
    }
}