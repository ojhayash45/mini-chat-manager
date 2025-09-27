const express = require('express');
const app  = express();
const mongoose = require('mongoose');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const path = require("path");
const Chat = require("./models/chat.js")
const methodOverride = require("method-override");

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/whatsapp';

// stablishing connection with db
main().then(() => {
    console.log("connection succesfull");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

// let chat1 = new Chat({
//     from : "neha",
//     to : "priya",
//     msg : "send me your exam sheets",
//     created_at : new Date(), //Z-UTC time
// })

// chat1.save().then((res) => {
//     console.log(res);
// })
// .catch((err) => {
//     console.log(err);
// })
// chats route
app.get("/chats", async(req,res, next) => {
    try {
        let chats = await Chat.find();
        // console.log(chats);
        res.render("index.ejs",{chats});
    } catch (e) {
        next(e);
    }
})
// New Route
app.get("/chats/new", (req,res) => {
    res.render("new.ejs");
});

// create route
app.post("/chats", async (req,res, next) => {
    try {
        let {from,msg,to} = req.body;
        let newChat = new Chat({
            from : from,
            msg : msg,
            to : to,
            created_at : new Date(),
        });
        await newChat.save();
        res.redirect("/chats");
    } catch(e) {
        next(e);
    }
})
// edit route 
app.get("/chats/:id/edit", async (req,res, next) => {
    try {
        let {id} = req.params;
        let chat = await Chat.findById(id);
        if (!chat) {
            return next(); // Pass to 404 handler
        }
        res.render("edit.ejs",{chat});
    } catch(e) {
        next(e);
    }
});
// update route
app.put("/chats/:id", async (req,res, next) => {
    try {
        let {id} = req.params;
        let {newMsg} = req.body;
        let updatedChat = await Chat.findByIdAndUpdate(id,{msg:newMsg},{runValidators:true,new:true});
        res.redirect("/chats");
    } catch(e) {
        next(e);
   }
});

// DELETE ROUTE
app.delete("/chats/:id",async (req,res, next) => {
    try {
        let {id} = req.params;
        let deletedChat = await Chat.findByIdAndDelete(id);
        res.redirect("/chats");
    } catch(e) {
        next(e);
    }
})
// home route
app.get("/", (req,res) => {
    res.redirect("/chats");
})

// Generic Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong! Please try again later.');
});

const port = process.env.PORT || 8080;
// starting the server
app.listen(port, () => {
    console.log(`Server is listenning on port ${port}`)
} )