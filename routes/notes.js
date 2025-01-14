const express = require("express");
const router = express.Router();
const fetchUser = require("../moddleware/fetch_user");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

// Get all notes
router.get("/fetch-all-notes", fetchUser, async (req, resp) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    if (notes) {
      resp.json(notes);
    }
  } catch (error) {
    resp.status(500).json(error);
  }
});

// Add new note
router.post(
  "/add-note",
  [
    body("title", "Enter a valid title.").isLength({ min: 2 }),
    body("description", "Enter a valid description.").isLength({ min: 5 }),
  ],
  fetchUser,
  async (req, resp) => {
    try {
      const result = validationResult(req);
      const { title, description, tag } = req.body;
      if (result.isEmpty()) {
        const notes = new Notes({
          user: req.user.id,
          title: title,
          description: description,
          tag: tag,
        });
        const savedNotes = await notes.save();
        if (savedNotes) {
          resp.json(savedNotes);
        }
      } else {
        return resp.send({ errors: result.array() });
      }
    } catch (error) {
      resp.status(500).json(error);
    }
  }
);

// Update notes
router.put("/update-note/:id", fetchUser, async (req, resp) => {
  try {
    const { title, description, tag } = req.body;
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    let note = await Notes.findById(req.params.id);
    if (!note) {
      return resp.status(404).send("Record not found.");
    } else {
      if (note.user.toString() !== req.user.id) {
        return resp.status(401).send("Not allowed.");
      } else {
        note = await Notes.findByIdAndUpdate(
          req.params.id,
          { $set: newNote },
          { new: true }
        );
        if (note) {
          resp.json(note);
        }
      }
    }
  } catch (error) {
    resp.status(500).json(error);
  }
});

// Delete note
router.delete("/delete-note/:id", fetchUser, async (req, resp) => {
  try {
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return resp.status(404).send("Record not found.");
    } else {
      if (note.user.toString() !== req.user.id) {
        return resp.status(401).send("Not allowed.");
      } else {
        const result = await Notes.findByIdAndDelete(req.params.id);
        if (result) {
          resp.json({
            message: "success",
            "message-content": "Note has been deleted.",
            result: result,
          });
        }
      }
    }
  } catch (error) {
    resp.status(500).json(error);
  }
});

module.exports = router;
