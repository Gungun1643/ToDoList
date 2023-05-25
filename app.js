//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
/*-----320use the lodash convection for homogenity------- */
const _ = require("lodash");

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

/* 317. Lets take the ToDoList at the next level */

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
/*connection string => 
mongodb+srv://gungunp1643:Gun1643gun@@cluster0.zmrakjl.mongodb.net/?retryWrites=true&w=majority */

/*317-6 => create a new database in the mongoose  */
// mongoose.connect("mongodb+srv://gungunp1643:Gun1643gun@@cluster0.zmrakjl.mongodb.net/ToDoListDB", {
//   useNewUrlParser: true,
// });
/*---------------------------------------------------------------------------- */
/*==========================================
I think you're confused with the mongodb account password and user password. You should use user password, not account password. That was the reason of my case.
=============== */
// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://gungunp1643:Gun1643gun%40@cluster0.zmrakjl.mongodb.net/?retryWrites=true&w=majority/ToDoListDB";

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);

/*extra-> /?retryWrites=true&w=majority */
/*---------------------------------------------- */
mongoose.connect("mongodb+srv://gungunp1643:Gun1643gun%40@cluster0.zmrakjl.mongodb.net/ToDoListDB", {
  useNewUrlParser: true,
});
/*---------------------------------------------------------------------------------------- */
// mongoose.connect("mongodb://127.0.0.1:27017/ToDoListDB", {
//   useNewUrlParser: true,
// });

/*317-7 create a new schema*/

const itemSchema = new mongoose.Schema({
  name: String,
});

/*317-9 create a new mongoose model  */

/*317-8 create a new mongoose model  */
const Item = mongoose.model("Item", itemSchema);

/*-----317-10.create 3 new models and pass over the items that are inside our items collectin */
const item1 = new Item({ name: "Welcome to your ToDoList " });
const item2 = new Item({ name: "Hit + to add a new item " });
const item3 = new Item({ name: " <-- this is to delete an item " });

/*-----317.11 create default items */
const defaultItems = [item1, item2, item3];
/*----320----- */
const listSchema = {
  name: String,
  items: [itemSchema],
};
/*singular version of hte model , schema nu name  */
const List = mongoose.model("List", listSchema);
/*318-2. to prevent the data being reinserted  */

/*-----318-1.rendering database items in the todo list ------- */

/*------------------------------------------------------------ */
app.get("/", async function (req, res) {
  try {
    const foundItems = await Item.find({});
    if (foundItems.length === 0) {
      await Item.insertMany(defaultItems);
      console.log("Successfully saved default items to DB.");
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred while rendering the page .. ");
  }
});

// /*-----318-1=4preview the items in the todo list  ------- */
// Item.find({})
//   .then((foundItems) => {
//     res.render("list", { listTitle: "Today", newListItems: foundItems });
//   })
//   .catch((err) => {
//     // Handle error
//     console.error(err);
//   });
/*-------318.3-------------------------------- */
// const defaultItems = [item1, item2, item3];
// Item.insertMany([item1, item2, item3])
//   .then(function () {
//     console.log("Data inserted"); // Success
//   })
//   .catch(function (error) {
//     console.log(error); // Failure
//   });

/*------------312-2---------------------
// app.get("/", async (_req, res) => {
//   try {
//     const item = await Item.find({});
//     // res.send(item);
//     res.render("list", { listTitle: "Today", newListItems: defaultItems });
//     console.log(item);
//   } catch (err) {
//     console.log(err);
//     res.redirect("/");
//   }
// });
/*---------321---------------- */
/*----------321 we need to have different pages for every different type of lists ------------------ */
/*last part of the url is the list title of the urls  */
app.get("/:customListName", async function (req, res) {
  // console.log(req.params.customListName);
  /*now what if we just want to access it -> rather tha creating  a new list everytime  */
  try {
    const customListName = _.capitalize(req.params.customListName);
    const foundList = await List.findOne({ name: customListName });

    if (!foundList) {
      // console.log("This should be when we need to create a new path for the file !!");
      const list = new List({ name: customListName, items: defaultItems });
      await list.save();
      res.redirect("/" + customListName);
    } else {
      // console.log("Exists !!-> we just need to redirect it ");
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items,
      });
      // 25/05
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred while rendering the page .. ");
  }
});
/*------------------319 to inserting the new items ------------------------------------------ */

app.post("/delete", async function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  try {
    if (listName === "Today") {
      await Item.findByIdAndRemove(checkedItemId);
      console.log("Successfully deleted checked item.");
      res.redirect("/");
    } else {
      const foundList = await List.findOneAndUpdate(
        { name: listName },
        { $pull: { items: { _id: checkedItemId } } }
      );
      res.redirect("/" + listName);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred while deleting the item .. ");
  }
});

/*------------319 ends ------------------- */
/*now we need to remove the item with the fetched id */

/*currently we don't have any submittting button so we cannot see what is there in the console log terminal  */

/*-------------------------------- */
app.get("/about", function (req, res) {
  res.render("about", { listTitle: "About List", newListItems: aboutItems });
});

app.listen(3000, function () {
  console.log("Server started on port 3010");
});
