const mongoose = require('mongoose');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
const Store = mongoose.model('Store');
const User = mongoose.model('User');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');

    if (!isPhoto) {
      next({ messsage: "Image isn't a valid photo!" }, false);
      return;
    }

    next(null, true);
  },
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  if (!req.file) {
    next();
    return;
  }

  const photoExt = req.file.mimetype.split('/')[1];
  const photoName = `${uuid.v4()}.${photoExt}`;
  const photo = await jimp.read(req.file.buffer);

  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${photoName}`);

  req.body.photo = photoName;
  next();
};

exports.getStores = async (req, res) => {
  const page = req.params.page || 1;
  const size = 4;
  const skip = page * size - size;

  const storesPromise = Store.find().skip(skip).limit(size).sort({
    createdAt: 'asc',
  });

  const countPromise = Store.count();

  const [stores, count] = await Promise.all([storesPromise, countPromise]);

  const totalPages = Math.ceil(count / size);

  if (!stores.length && size) {
    req.flash('info', `Hey, that page doesn't exist. I put you on page ${totalPages}`);
    res.redirect(`/stores/page/${totalPages}`);
    return;
  } 

  res.render('index', {
    title: 'Stores',
    stores,
    page,
    totalPages,
    count
  });
};

exports.getStoreBySlug = async (req, res, next) => {
  const slug = req.params.slug;
  const store = await Store.findOne({ slug }).populate('author reviews');

  if (!store) {
    return next();
  }

  res.render('storeDetails', { title: store.name, store });
};

exports.addStore = (req, res) => {
  res.render('editStore', {
    title: 'Add Store',
  });
};

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = new Store(req.body);
  await store.save();

  req.flash('success', 'Store created successfully!');
  res.redirect('/');
};

const confirmUser = (store, user) => {
  if (!store.author || !store.author.equals(user._id)) {
    throw new Error('You need to be the author to edit this store!');
  }
};

exports.editStore = async (req, res) => {
  const id = req.params.id;
  const store = await Store.findOne({ _id: id });

  confirmUser(store, req.user);

  res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  const data = { ...req.body };
  const id = req.params.id;

  data.location.type = 'Point';

  const updatedStore = await Store.findOneAndUpdate({ _id: id }, data, {
    new: true,
    runValidators: true,
  });

  req.flash('success', 'Store updated successfully!');
  res.redirect(`/store/${updatedStore.slug}`);
};

exports.getStoresByTag = async (req, res) => {
  const currentTag = req.params.tag;
  const tagsQuery = currentTag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagsQuery });

  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

  res.render('tags', { title: 'Tags', tags, stores, currentTag });
};

exports.search = async (req, res) => {
  const query = req.query.q;

  const stores = await Store.find(
    {
      $text: {
        $search: query,
      },
    },
    {
      score: {
        $meta: 'textScore',
      },
    }
  )
    .sort({
      score: { $meta: 'textScore' },
    })
    .limit(5);

  res.json(stores);
};

exports.map = (req, res) => {
  res.render('map', { title: 'Map' });
};

exports.mapStores = async (req, res) => {
  const lat = req.query.lat;
  const lng = req.query.lng;
  const coordinates = [lng, lat].map(parseFloat);

  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates,
        },
        $maxDistance: 100000, // 10km
      },
    },
  };

  const stores = await Store.find(query)
    .select('name slug photo location')
    .limit(10);

  res.json(stores);
};

exports.favoritesPage = async (req, res) => {
  const favorites = req.user.favorites;
  const stores = await Store.find({
    _id: {
      $in: favorites,
    },
  });

  res.render('favorites', { title: 'Favorites Stores', stores });
};

exports.favorite = async (req, res) => {
  const favorites = req.user.favorites.map((obj) => obj.toString());
  const userId = req.user._id;
  const storeId = req.params.id;
  const operator = favorites.includes(storeId) ? '$pull' : '$addToSet';

  const user = await User.findByIdAndUpdate(
    userId,
    { [operator]: { favorites: storeId } },
    { new: true }
  );

  res.json(user);
};

exports.getTopStores = async (req, res) => {
  const stores = await Store.getTopStores();

  res.render('topStores', { title: '⭐ Top Stores', stores });
};
