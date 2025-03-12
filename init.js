const mongoose = require("mongoose");
const Chat = require("./models/chat.js");

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

let allChats = [
  {
    from: "neha",
    to: "priya",
    msg: "send me your exam sheets",
    created_at: new Date(),
  },
  {
    from: "priya",
    to: "alisa",
    msg: "please give me notes",
    created_at: new Date(),
  },
  {
    from: "max",
    to: "ray",
    msg: "hey bro! what's going on",
    created_at: new Date(),
  },
  {
    from: "garry",
    to: "taison",
    msg: "let's go to the gym",
    created_at: new Date(),
  },
];

Chat.insertMany(allChats);
