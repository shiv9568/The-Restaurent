import mongoose, { Schema } from 'mongoose';
const CategorySchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    displayOnHomepage: { type: Boolean, default: true },
    restaurantId: { type: String },
}, {
    timestamps: true,
});
CategorySchema.index({ displayOnHomepage: 1 });
export default mongoose.model('Category', CategorySchema);
//# sourceMappingURL=Category.js.map