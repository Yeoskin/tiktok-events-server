// index.js
const express = require("express");
const cors    = require("cors");
const axios   = require("axios");
const crypto  = require("crypto");

const app = express();

// 1) On autorise toutes les origines (y compris localhost) à faire des POST
app.use(cors());
app.use(express.json());

const TOKEN    = "850cd9c3f67581eff14fc3694aae5742a385d191";
const PIXEL_ID = "CVUIKCBC77U3AEENFDSG";

app.post("/tiktok-event", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).send("Email requis dans le corps de la requête.");
  }

  // hash de l'email
  const hashedEmail = crypto.createHash("sha256")
                            .update(email)
                            .digest("hex");

  const payload = {
    pixel_code: PIXEL_ID,
    event:      "Lead",
    event_id:   `lead-${Date.now()}`,
    timestamp:  Math.floor(Date.now() / 1000),
    properties:{
      value:    1,
      currency: "EUR"
    },
    user:{
      email:      hashedEmail,
      ip:         req.ip,
      user_agent: req.headers["user-agent"]
    }
  };

  try {
    await axios.post(
      "https://business-api.tiktok.com/open_api/v1.2/event/track/",
      payload,
      { headers:{
          "Access-Token": TOKEN,
          "Content-Type":  "application/json"
        }
      }
    );
    res.send("Event sent to TikTok");
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Error sending event");
  }
});

// Render vous fournit automatiquement la variable d'environnement PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => 
  console.log(`TikTok event API listening on port ${PORT}`)
);
