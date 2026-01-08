import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: String,
    code: { type: String, unique: true, required: true },
    stock: { type: Number, default: 0 },
    thumbnails: [String],
    status: { type: Boolean, default: true }
}, { timestamps: true });


productSchema.plugin(mongoosePaginate);

export default mongoose.model('Product', productSchema);

