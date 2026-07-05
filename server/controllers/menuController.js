import MenuItem from '../models/MenuItem.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
export const getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({});
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
export const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (menuItem) {
      res.json(menuItem);
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a menu item
// @route   POST /api/menu
// @access  Public
export const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, image, isAvailable } = req.body;
    
    let imageUrl = image;
    if (image && image.startsWith('data:image')) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: 'restaurant_menu',
      });
      imageUrl = uploadResponse.secure_url;
    }

    const menuItem = new MenuItem({
      name,
      description,
      price,
      category,
      image: imageUrl,
      isAvailable,
    });
    const createdItem = await menuItem.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Public
export const updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, image, isAvailable } = req.body;
    const menuItem = await MenuItem.findById(req.params.id);
    if (menuItem) {
      menuItem.name = name || menuItem.name;
      menuItem.description = description || menuItem.description;
      menuItem.price = price || menuItem.price;
      menuItem.category = category || menuItem.category;
      
      if (image) {
        let imageUrl = image;
        if (image.startsWith('data:image')) {
          const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: 'restaurant_menu',
          });
          imageUrl = uploadResponse.secure_url;
        }
        menuItem.image = imageUrl;
      }
      
      menuItem.isAvailable = isAvailable !== undefined ? isAvailable : menuItem.isAvailable;

      const updatedItem = await menuItem.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Public
export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (menuItem) {
      await menuItem.deleteOne();
      res.json({ message: 'Menu item removed' });
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed initial menu items
// @route   POST /api/menu/seed
// @access  Public
export const seedMenuItems = async (req, res) => {
  const sampleItems = [
    {
      name: "Signature Seafood Platter",
      description: "Freshly caught rock lobster, grilled jumbo prawns, and tropical fruit medley served with our house-secret chili butter.",
      price: 34.5,
      category: "Starters",
      image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=600&q=80",
      isAvailable: true,
      dietary: ["Gluten-Free"],
      spicyLevel: 1,
      rating: 4.8,
      numReviews: 2,
      reviews: [
        {
          name: "Saman Kumara",
          rating: 5,
          comment: "Absolutely amazing! The lobster was incredibly fresh.",
          user: "6684df61b0c034b7f9411111"
        },
        {
          name: "Emily Watson",
          rating: 4,
          comment: "Very delicious seafood platter. Highly recommended.",
          user: "6684df61b0c034b7f9422222"
        }
      ]
    },
    {
      name: "Traditional Crab Curry",
      description: "Authentic Sri Lankan lagoon crabs slow-cooked in a rich blend of roasted spices, coconut milk, and curry leaves.",
      price: 28.0,
      category: "Main Course",
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
      isAvailable: true,
      dietary: ["Gluten-Free"],
      spicyLevel: 3,
      rating: 5.0,
      numReviews: 2,
      reviews: [
        {
          name: "Kasun Kalhara",
          rating: 5,
          comment: "Best crab curry I have ever had! Spicy and rich.",
          user: "6684df61b0c034b7f9433333"
        },
        {
          name: "Nimal Perera",
          rating: 5,
          comment: "Incredibly authentic flavor. A must try!",
          user: "6684df61b0c034b7f9444444"
        }
      ]
    },
    {
      name: "Passion Fruit Orchid Martini",
      description: "A vibrant fusion of local passion fruit nectar, premium vodka, and a touch of orchid essence.",
      price: 14.0,
      category: "Drinks",
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
      isAvailable: true,
      dietary: ["Vegetarian", "Vegan", "Gluten-Free"],
      spicyLevel: 0,
      rating: 4.5,
      numReviews: 2,
      reviews: [
        {
          name: "Sarah Jenkins",
          rating: 4,
          comment: "Lovely cocktails! Very refreshing with natural passion fruit.",
          user: "6684df61b0c034b7f9455555"
        },
        {
          name: "David Silva",
          rating: 5,
          comment: "Perfect drink by the beach. Love the orchid touch.",
          user: "6684df61b0c034b7f9466666"
        }
      ]
    },
    {
      name: "Truffle Tagliatelle",
      description: "Handcrafted pasta with creamy black truffle sauce, wild mushrooms, and shaved parmesan.",
      price: 24.5,
      category: "Main Course",
      image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80",
      isAvailable: true,
      dietary: ["Vegetarian"],
      spicyLevel: 0,
      rating: 4.5,
      numReviews: 2,
      reviews: [
        {
          name: "Sophia Lorenz",
          rating: 4,
          comment: "Excellent truffle aroma. Pasta was perfectly al dente.",
          user: "6684df61b0c034b7f9477777"
        },
        {
          name: "Marcello V.",
          rating: 5,
          comment: "Exceeded my expectations. Premium quality.",
          user: "6684df61b0c034b7f9488888"
        }
      ]
    },
    {
      name: "Crispy Skin Salmon",
      description: "Pan-seared Atlantic salmon with asparagus, saffron butter sauce, and herb-roasted baby potatoes.",
      price: 28.0,
      category: "Main Course",
      image: "https://images.unsplash.com/photo-1485962398705-ef6a13c41e8f?auto=format&fit=crop&w=600&q=80",
      isAvailable: true,
      dietary: ["Gluten-Free"],
      spicyLevel: 0,
      rating: 4.0,
      numReviews: 1,
      reviews: [
        {
          name: "Chris Evans",
          rating: 4,
          comment: "Salmon skin was perfectly crispy. Saffron sauce is nice.",
          user: "6684df61b0c034b7f9499999"
        }
      ]
    },
    {
      name: "Warm Chocolate Lava Cake",
      description: "Decadent chocolate cake with a molten center, served with house-made vanilla bean gelato.",
      price: 11.5,
      category: "Desserts",
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
      isAvailable: true,
      dietary: ["Vegetarian"],
      spicyLevel: 0,
      rating: 5.0,
      numReviews: 2,
      reviews: [
        {
          name: "Anya Taylor",
          rating: 5,
          comment: "Warm chocolate lava with rich gelato - match made in heaven.",
          user: "6684df61b0c034b7f94aaaaa"
        },
        {
          name: "Leo Decap",
          rating: 5,
          comment: "Best dessert in town. Simply outstanding.",
          user: "6684df61b0c034b7f94bbbbb"
        }
      ]
    }
  ];

  try {
    await MenuItem.deleteMany({});
    const createdItems = await MenuItem.insertMany(sampleItems);
    res.status(201).json(createdItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/menu/:id/reviews
// @access  Private
export const createMenuItemReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const menuItem = await MenuItem.findById(req.params.id);

    if (menuItem) {
      const alreadyReviewed = menuItem.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      menuItem.reviews.push(review);
      menuItem.numReviews = menuItem.reviews.length;
      menuItem.rating =
        menuItem.reviews.reduce((acc, item) => item.rating + acc, 0) /
        menuItem.reviews.length;

      await menuItem.save();
      res.status(201).json({ message: 'Review added', rating: menuItem.rating });
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

