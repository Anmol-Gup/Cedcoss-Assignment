const express = require("express");
const app = express();
const axios = require("axios");
const cors = require("cors");
const bearerToken = "YOUR_PRIVATE_ACCESS_TOKEN";
const url = "https://api.hubapi.com/crm/v3/objects/products";
const multer = require("multer");
const fs = require("fs");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors());

app.get("/api/products", async (req, res) => {
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });
  res.status(200).json(data);
});

app.post("/api/products", (req, res) => {
  const { properties } = req.body;
  axios
    .post(
      url,
      { properties },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    )
    .then(function (response) {
      console.log(response.data);
      res.status(201).json(response.data);
    })
    .catch(function (error) {
      console.log(error);
      res.json(error.message);
    });
});

app.post("/api/file", upload.single("file"), async (req, res) => {
  // console.log(req.file);
  const { path } = req.file;
  let formData = {
    file: fs.createReadStream(path),
    options: JSON.stringify({ access: "PRIVATE" }),
    folderPath: "/uploads/",
  };

  await axios
    .post("https://api.hubapi.com/files/v3/files", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${bearerToken}`,
      },
    })
    .then(function (response) {
      console.log(response.data);

      if (response.status === 201) {
        fs.unlink(path, (err) => {
          if (err) {
            console.error(`Error removing file: ${err}`);
            return;
          }
          console.log(`File ${path} has been successfully removed.`);
        });
        res.status(201).json(response.data);
      }
    })
    .catch(function (error) {
      console.log(error);
      res.json(error.message);
    });
});

app.listen(3000, () => console.log(`Server is running at port 3000...`));
