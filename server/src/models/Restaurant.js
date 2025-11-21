import mongoose, { Schema } from 'mongoose';
const RestaurantSchema = new Schema({
    name: { type: String, required: true },
    logo: { type: String },
    about: { type: String },
    address: { type: String },
    openTime: { type: String },
    closeTime: { type: String },
    contactNumber: { type: String },
    deliveryZones: [{ type: String }],
    isClosed: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.model('Restaurant', RestaurantSchema);
//# sourceMappingURL=Restaurant.js.map