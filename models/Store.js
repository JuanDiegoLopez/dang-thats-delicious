const mongoose = require('mongoose');
const slugs = require('slugs');

const storeSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Store must have a name!',
  },
  description: {
    type: String,
    trim: true,
  },
  slug: String,
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: [
      {
        type: Number,
        required: 'You must supply coordinates!',
      },
    ],
    address: {
      type: String,
      required: 'You must supply an address!',
    },
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an Author!',
  },
});

storeSchema.set('toObject', { virtuals: true });
storeSchema.set('toJSON', { virtuals: true });

storeSchema.index({
  name: 'text',
  description: 'text',
});

storeSchema.index({
  location: '2dsphere',
});

function autopopulate(next) {
  this.populate('reviews');
  next();
}

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

storeSchema.pre('save', async function (next) {
  if (!this.isModified('name')) {
    next();
    return;
  }

  this.slug = slugs(this.name);

  const slugRegExp = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({ slug: slugRegExp });

  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }

  next();
});

storeSchema.statics.getTagsList = function () {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};

storeSchema.statics.getTopStores = function () {
  return this.aggregate([
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'store',
        as: 'reviews',
      },
    },
    {
      $match: {
        'reviews.1': {
          $exists: true,
        },
      },
    },
    {
      $addFields: {
        averageRating: {
          $avg: '$reviews.rating',
        },
      },
    },
    {
      $sort: {
        averageRating: -1,
      },
    },
    {
      $limit: 10 ,
    },
  ]);
};

storeSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'store',
});

module.exports = mongoose.model('Store', storeSchema);
