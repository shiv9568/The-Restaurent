import mongoose, { Schema } from 'mongoose';
const OfferSchema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, min: 0 },
    maxDiscountAmount: { type: Number, min: 0 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    applicableOn: { type: String, enum: ['all', 'specific_items'], default: 'all' },
    itemIds: [{ type: String }],
}, {
    timestamps: true,
});
OfferSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });
export default mongoose.model('Offer', OfferSchema);
//# sourceMappingURL=Offer.js.map