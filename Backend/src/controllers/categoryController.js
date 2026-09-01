const Category = require('../models/categoryModel')
const asyncHandler = require('express-async-handler')
const cloudinary = require('../config/cloudinary')

// Create new category (admin only)
const addCategory = asyncHandler(async (req, res) => {
    const { name, description, parent } = req.body

    const images = []

    // Upload category images to Cloudinary
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'categories',
                width: 800,
                crop: 'scale',
            })

            images.push({
                public_id: result.public_id,
                url: result.secure_url,
            })
        }
    }

    // Check if category already exists
    const categoryExists = await Category.findOne({ name })

    if (categoryExists) {
        res.status(400)
        throw new Error('Category already exists')
    }

    // Validate parent category
    if (parent) {
        const parentCategory = await Category.findById(parent)

        if (!parentCategory) {
            res.status(400)
            throw new Error('Parent category not found')
        }
    }

    // Create category
    const category = await Category.create({
        name,
        description,
        image: images,
        parent: parent || null,
    })

    res.status(201).json({
        success: true,
        data: category,
        message: 'Category created successfully',
    })
})


// Get all categories
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({
        isActive: true
    }).populate('subcategories')

    res.json({
        success: true,
        data: categories,
    })
})


// Get single category by ID
const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(
        req.params.id
    ).populate('subcategories')

    if (!category) {
        res.status(404)
        throw new Error('Category not found')
    }

    res.json({
        success: true,
        data: category,
    })
})


// Update category
const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id)

    if (!category) {
        res.status(404)
        throw new Error('Category not found')
    }

    // Prevent category from being its own parent
    if (
        req.body.parent &&
        req.body.parent === req.params.id
    ) {
        res.status(400)
        throw new Error('A category cannot be its own parent')
    }

    category.name = req.body.name ?? category.name
    category.description = req.body.description ?? category.description
    category.image = req.body.image ?? category.image
    category.parent = req.body.parent ?? category.parent
    category.isActive = req.body.isActive ?? category.isActive

    const updatedCategory = await category.save()

    res.json({
        success: true,
        data: updatedCategory,
        message: 'Category updated successfully',
    })
})


// Delete category
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id)

    if (!category) {
        res.status(404)
        throw new Error('Category not found')
    }

    // Prevent deleting category with subcategories
    const hasChildren = await Category.exists({
        parent: category._id
    })

    if (hasChildren) {
        res.status(400)
        throw new Error(
            'Cannot delete a category that has subcategories. Reassign or delete them first.'
        )
    }

    // Delete images from Cloudinary
    if (category.image && category.image.length > 0) {
        for (const image of category.image) {
            if (image.public_id) {
                await cloudinary.uploader.destroy(
                    image.public_id
                )
            }
        }
    }

    await category.deleteOne()

    res.json({
        success: true,
        message: 'Category removed',
    })
})


module.exports = {
    addCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
}