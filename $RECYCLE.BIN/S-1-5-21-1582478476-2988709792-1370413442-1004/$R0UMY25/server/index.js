const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());

const scriptures = [
  {
    reference: "John 3:16",
    text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."
  },
  {
    reference: "Romans 10:9",
    text: "That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved."
  }
];

app.get('/api/scripture', (req, res) => {
  const random = scriptures[Math.floor(Math.random() * scriptures.length)];
  res.json(random);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
