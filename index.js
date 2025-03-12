const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Chat = require("./models/chat.js");
const methodOverride = require("method-override");
const ExpressError = require("./ExpressError");

app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

main()
  .then((res) => {
    console.log("connection successful");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/fakeWhatsapp");
}

// let chat1 = new Chat({
//   from: "neha",
//   to: "priya",
//   msg: "send me your exam sheets",
//   created_at: new Date(),
// });

// chat1
//   .save()
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

app.get("/", (req, res) => {
  res.send("root is working");
});

//Index route
app.get("/chats", async (req, res) => {
  try {
    let chats = await Chat.find();
    res.render("index.ejs", { chats });
  } catch (err) {
    next(err);
  }
});

//new route
app.get("/chats/new", (req, res) => {
  // throw new ExpressError(404, "Page not Found");
  res.render("new.ejs");
});

//create route
app.post(
  "/chats",
  asyncWrap(async (req, res, next) => {
    let { from, msg, to } = req.body;
    let newChat = new Chat({
      from: from,
      msg: msg,
      to: to,
      created_at: new Date(),
    });

    await newChat.save();
    res.redirect("/chats");
  })
);

function asyncWrap(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
}
//New - show route
app.get(
  "/chats/:id",
  asyncWrap(async (req, res, next) => {
    let { id } = req.params;
    let chat = await Chat.findById(id);
    if (!chat) {
      next(new ExpressError(500, "Chat not found"));
    }
    res.render("edit.ejs", { chat });
  })
);

//Edit Route
// app.get("/chats/:id/edit", async (req, res) => {
//   try {
//     let { id } = req.params;
//     let chat = await Chat.findById(id);
//     res.render("edit.ejs", { chat });
//   } catch (err) {
//     next(err);
//   }
// });

app.get(
  "/chats/:id/edit",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let chat = await Chat.findById(id);
    res.render("edit.ejs", { chat });
  })
);

app.put(
  "/chats/:id",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let { msg: newMsg } = req.body;
    // let updated_at = new Date();
    // Chat.findByIdAndInsert(id, {updated_at});
    let updatedChat = await Chat.findByIdAndUpdate(
      id,
      { msg: newMsg },
      { runValidators: true, new: true }
    );
    console.log(updatedChat);
    res.redirect("/chats");
  })
);

//destroy route
app.get(
  "/chats/:id",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let deletedChat = await Chat.findByIdAndDelete(id);
    console.log(deletedChat);
    res.redirect("/chats");
  })
);


const handleValidationErrors = (err) => {
  console.log("this was a Validation error. Please follow rules");
  console.dir(err.message);
  return err;
}

app.use((err, req, res, next) => {
  console.log(err.name);
  if (err.name === "ValidationError") {
    err = handleValidationErrors(err);
  }
  next(err);
});

//Error Handling Middleware
app.use((err, req, res, next) => {
  let { status = 500, message = "Some Error Ocurred" } = err;
  res.status(status).send(message);
});

app.listen(8080, () => {
  console.log(`server is listening on port 8080`);
});
