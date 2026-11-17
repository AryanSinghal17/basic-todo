require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const db = require("./model");
const dns = require("node:dns/promises");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors());


mongoose
  .connect(process.env.MONGO_URL)
  .then((res) => {
    app.listen(3031, () => {
      console.log("server is running");
    });

    console.log("db is conneted");
  })
  .catch((err) => {
    console.log("error" + err);
  });
// 1 post and save
app.post("/todos", async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      message: "pls fill all details",
    });
  }

  try {
    const newData = new db({
      title,
      description,
    });

    const data = await newData.save();
    return res.status(201).json({
      message: "todo create",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

// 2 find
app.get("/todos", async (req, res) => {
  try {
    const todoData = await db.find();
    return res.json({
      message: todoData,
    });
  } catch (err) {
    return res.status(500).json({
      message: "there is an error",
    });
  }
});

// 3 find by id
app.get("/todos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const todoData = await db.findById(id);
    if (!todoData) {
      return res.status(404).json({
        error: "id not found",
      });
    } else {
      return res.json({
        message: todoData,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "id did not find",
    });
  }
});

// 4 update by id 
app.put("/todos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description, completed } = req.body;

    const updateId = await db.findByIdAndUpdate(
      id,
      {
        title,
        description,
        completed
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updateId) {
      return res.status(404).json({
        message: "Todo not found"
      });
    }

    return res.status(200).json({
      message: "Todo updated successfully",
      data: updateId
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
});

// 5 delete by id 
app.delete("/todos/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const deletedTodo = await db.findByIdAndDelete(id);

    if (!deletedTodo) {
      return res.status(404).json({
        message: "Todo not found"
      });
    }

    return res.status(200).json({
      message: "Todo deleted successfully",
      data: deletedTodo
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
});
app.get("/", (req, res) => {
  res.send("Todo API is running");
});
