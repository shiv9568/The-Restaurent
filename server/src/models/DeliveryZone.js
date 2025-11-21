import mongoose, { Schema } from 'mongoose';
const DeliveryZoneSchema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    deliveryFee: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, required: true, min: 0 },
    estimatedTime: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    coordinates: [{
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        }],
}, {
    timestamps: true,
});
DeliveryZoneSchema.index({ isActive: 1 });
export default mongoose.model('DeliveryZone', DeliveryZoneSchema);
//# sourceMappingURL=DeliveryZone.js.map