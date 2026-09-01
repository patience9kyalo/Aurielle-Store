const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter a product name'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please enter a product description'],
        trim: true,
        maxlength: [200, 'Product description cannot exceed 200 characters'],
    },
    price: {
        type: Number,
        required: [true, 'Please enter a product price'],
        min: [0, 'Product price cannot be negative'],
    },
    discountPrice: {
        type: Number,
        min: [0, 'Discount price cannot be negative'],
        validate: {
            validator: function (value) {
                // Ensure discountPrice is less than price
                return !value || value < this.price;
            },
            message: 'Discount price must be less than the original price'
        }
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please enter a product category'],
        ref: 'Category',
        required: [true, 'Please select a category'],
    },
    stock: {
        type: Number,
        required: [true, 'Please enter the stock quantity'],
        min: [0, 'Stock quantity cannot be negative'],
        default: 0,
    },
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        }
    ],
    rating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    specifications: {
        type: Map,
        of: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
})

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ rating: -1 });

productSchema.virtual('finalPrice').get(function () {
    return this.discountPrice || this.price;
})

productSchema.virtual('discountPercentage').get(function () {
    if (this.discountPrice) {
        return Math.round(((this.price - this.discountPrice) / this.price) * 100);
    }
    return 0;
})

module.exports = mongoose.model('Product', productSchema);