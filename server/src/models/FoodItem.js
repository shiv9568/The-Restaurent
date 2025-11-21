import mongoose, { Schema } from 'mongoose';
const FoodItemSchema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '/placeholder.svg' },
    category: { type: String, required: true },
    categoryId: { type: String },
    isVeg: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    displayOnHomepage: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    restaurantId: { type: String },
}, {
    timestamps: true,
});
FoodItemSchema.index({ category: 1 });
FoodItemSchema.index({ categoryId: 1 });
FoodItemSchema.index({ displayOnHomepage: 1, isAvailable: 1 });
export default mongoose.model('FoodItem', FoodItemSchema);
//# sourceMappingURL=FoodItem.js.map