import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const walletSchema = new mongoose.Schema(
    {
        currency: {
            type: String,
            required: true, // e.g., 'NGN', 'USD', 'BTC'
            uppercase: true,
        },
        balance: {
            type: Number,
            default: 0,
        },
        reserved: {
            type: Number,
            default: 0, // amount locked for pending transactions
        },
    },
    { _id: false }
);

const kycSchema = new mongoose.Schema(
    {
        fullName: String,
        dateOfBirth: Date,
        address: String,
        governmentIdType: String, // e.g., 'NIN', 'BVN', 'Passport'
        governmentIdNumber: String,
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending',
        },
        documents: [
            {
                type: {
                    type: String, // 'ID_CARD', 'UTILITY_BILL', etc.
                },
                url: String,
                verified: { type: Boolean, default: false },
            },
        ],
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: false, unique: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        phone: { type: String, unique: true, sparse: true },
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        middleName: { type: String, required: false, trim: true },
        
        password: { type: String, required: true },
        
        // Security
        twoFactorEnabled: { type: Boolean, default: false },
        twoFactorSecret: { type: String },
        failedLoginAttempts: { type: Number, default: 0 },
        accountLockedUntil: { type: Date },
        
        // Role and permissions
        role: {
            type: String,
            enum: ['user', 'merchant', 'admin', 'superadmin'],
            default: 'user',
        },
        
        // Wallets
        wallets: [walletSchema], // A user can have multiple wallets
        
        // KYC Information
        kyc: kycSchema,
        
        // Account status
        status: {
            type: String,
            enum: ['active', 'suspended', 'blocked', 'deleted'],
            default: 'active',
        },
        
        // Metadata
        lastLogin: Date,
        lastLoginIP: String,
        
        // Referral
        referralCode: { type: String, unique: true, sparse: true },
        referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        
        // Audit
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // for admin-created accounts
    },
    { timestamps: true }
);

// Password hashing before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Password validation
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Generate referral code automatically
userSchema.pre('save', function (next) {
    if (!this.referralCode) {
        this.referralCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
    }
    
    // hash the governmentIdNumber on save
    if (this.kyc && this.isModified('kyc.governmentIdNumber')) {
        const salt = bcrypt.genSaltSync(10);
        this.kyc.governmentIdNumber = bcrypt.hashSync(this.kyc.governmentIdNumber, salt);
    }
    next();
});

userSchema.pre('save', function(next) {
    if (!this.username) {
        if (this.email) {
            const emailNamePart = this.email.split('@')[0].toLowerCase();
            const randomNumber = Math.floor(1000 + Math.random() * 9000);
            this.username = `${emailNamePart}${randomNumber}`;
        }
    }
    next();
});

const User = mongoose.model('User', userSchema);

export default User;
