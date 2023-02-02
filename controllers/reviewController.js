const moongose = require('mongoose');
const Review = moongose.model('Review');

exports.addReview = async (req, res) => {
  const storeId = req.params.storeId;
  const userId = req.user._id;

  const review = new Review({
    author: userId,
    store: storeId,
    text: req.body.text,
    rating: req.body.rating
  });

  await review.save();

  req.flash('success', 'Review saved!');
  res.redirect('back');
};
