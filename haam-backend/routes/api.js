//js
const express = require("express");
const { getProducts } = require("../controllers/productsController");
const { registerUser } = require("../controllers/loginController");
const {
  getCustomers,
  updateCustomers,
  deleteCustomers,
} = require("../controllers/customersController");
const authToken = require("../middleware/authenticateToken");
const {
  addCategory,
  deleteCategory,
  getType,
  addType,
  deleteType,
  getCategory,
  updateCategory,
  updateType,
} = require("../controllers/optionsController");
const multer = require("multer");
const router = express.Router();
const Product = require("../models/products");
const {getOrders,addOrder, updateOrder} = require("../controllers/ordersController")
const Orders = require("../models/orders");


router.get("/products", getProducts);

// for uploading image
// For file upload
let path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now()
    req.image_timestamp = timestamp;
    cb(null,timestamp+ "_" +file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
});

router.post("/product", authToken, upload.single("image"), async (req, res) => {
  try {
    const { name, price, description, category, type, size, quantity } =
      req.body;
    console.log(category)
    console.log(type)
    console.log(typeof(category));
    const image = req.file.filename;
    if (name != "" && price > 0) {
      const last = await Product.find({}).sort({_id:-1}).limit(1);
      const id = last[0].ProductID + 1;
      const product = new Product({
        ProductID: id,
        ProductName: name,
        CategoryID: category,
        QuantityPerUnit: quantity,
        UnitPrice: price,
        Description: description,
        Size: size,
        Type: type,
        Image: image,
      });
      product.save().then((product) => {
        res.send(product);
      });
    }
  } catch (err) {
    console.log(err);
  }
});
// To update product
router.put("/product", authToken, upload.single("Image"), async (req, res) => {
  try {
    const {
      _id,
      Image,
      ProductName,
      CategoryID,
      Type,
      UnitPrice,
      Size,
      QuantityPerUnit,
      Description,
    } = req.body;
    let image = Image;
    if (typeof Image != "string") {
      image = req.file.filename;
    }
    const result = await Product.findByIdAndUpdate(_id, {
      Image: image,
      ProductName,
      CategoryID,
      Type,
      UnitPrice,
      Size,
      QuantityPerUnit,
      Description,
    });
    res.send(result);
  } catch (err) {
    console.log(err);
  }
});
// To delete product
router.post("/delete-product", authToken, async (req, res) => {
  try {
    const { _id } = req.body;
    const result = await Product.findByIdAndDelete(_id);
    res.send(result);
  } catch (err) {
    console.log(err);
  }
});

router.route("/register").post(upload.single("image"),async (req, res) => {
  try {
    await registerUser(req, res);
  } catch (err) {
    console.log(err); //eslint-disable-line
  }
});

// READ Customers
router.get("/customers", getCustomers);

// UPDATE Customers
router.route("/update-customer").post(authToken,upload.single("image"), async (req, res) => {
  try {
    await updateCustomers(req, res);
  } catch (err) {
    console.log(err); //eslint-disable-line
  }
});

// DELETE Customers
router.route("/delete-customer").post(authToken, async (req, res) => {
  try {
    await deleteCustomers(req, res);
  } catch (err) {
    console.log(err); //eslint-disable-line
  }
});

// Routes for Options (Type and Category)
router.get("/options/type", async (req, res) => {
  try {
      await getType(req, res);
  } catch (err) {
    console.log(err);
  }
});
router.get("/options/category", async (req, res) => {
  try {
      await getCategory(req, res);
  } catch (err) {
    console.log(err);
  }
});
router.post("/options/type", async (req, res) => {
  try {
    if (req.body.name != "") {
      await addType(req, res);
    }
  } catch (err) {
    console.log(err);
  }
});
router.post("/options/delete-type", async (req, res) => {
  try {
    console.log(req.body);
      await deleteType(req, res);
  } catch (err) {
    console.log(err);
  }
});
router.post("/options/category", async (req, res) => {
  try {
    if (req.body.name != "") {
      await addCategory(req, res);
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/options/delete-category", async (req, res) => {
  try {
      await deleteCategory(req, res);
  } catch (err) {
    console.log(err);
  }
});
router.post("/options/type-update", async (req, res) => {
  try {
    console.log(req.body);
      await updateType(req, res);
  } catch (err) {
    console.log(err);
  }
});
router.post("/options/category-update", async (req, res) => {
  try {
    console.log(req.body);
      await updateCategory(req, res);
  } catch (err) {
    console.log(err);
  }
});

// Routes For Orders
router.get("/orders",async(req,res)=>{
  try {
    await getOrders(req, res);
} catch (err) {
  console.log(err);
}
})
router.post("/orders",async(req,res)=>{
  try {
    await addOrder(req, res);
} catch (err) {
  console.log(err);
}
})
// To delete order
router.post("/delete-order", authToken, async (req, res) => {
  try {
    const { _id } = req.body;
    const result = await Orders.findByIdAndDelete(_id);
    res.send(result);
  } catch (err) {
    console.log(err);
  }
});
router.post("/update-order",async(req,res)=>{
  try {
    await updateOrder(req, res);
} catch (err) {
  console.log(err);
}
})
// router.get("/addsample",async(req,res)=>{
//   try {
//     const order = new Orders({OrderID:101011,CustomerID:1,ProductID:1654671383537,QuantityOrdered:1,OrderDate:"2020-01-01",ShippedDate:"2020-01-01",RequiredDate:"2020-01-01",Comment:"Nice",Status:"Coming"});
//     await order.save();
//     res.send("done");
// } catch (err) {
//   console.log(err);
// }
// })


module.exports = router;
