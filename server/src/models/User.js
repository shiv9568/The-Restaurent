import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
const AddressSchema = new Schema({
    id: { type: String, required: true },
    label: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
}, { _id: false });
const UserSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    phone: { type: String },
    clerkId: { type: String, unique: true, sparse: true },
    role: {
        type: String,
        enum: ['user', 'admin', 'super-admin'],
        default: 'user',
    },
    addresses: [AddressSchema],
}, {
    timestamps: true,
});
// Hash password before save
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    if (this.password) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});
// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};
export default mongoose.model('User', UserSchema);
//# sourceMappingURL=User.js.map