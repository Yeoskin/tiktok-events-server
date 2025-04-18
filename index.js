const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const app = express();
app.use(express.json());

const TOKEN = "850cd9c3f67581eff14fc3694aae5742a385d191";
const PIXEL_ID = "CVUIKCBC77U3AEENFDSG";

app.post("/tiktok-event", async (req, res) => {
  const email = req.body.email;
  const hashedEmail = crypto.createHash("sha256").update(email).digest("hex");

  const payload = {
    pixel_code: PIXEL_ID,
    event: "Lead",
    event_id: `lead-${Date.now()}`,
    timestamp: Math.floor(Date.now() / 1000),
    properties: {
      value: 1,
      currency: "EUR"
    },
    user: {
      email: hashedEmail,
      ip: req.ip,
      user_agent: req.headers["user-agent"]
    }
  };

  try {
    await axios.post(
      "https://business-api.tiktok.com/open_api/v1.2/event/track/",
      payload,
      {
        headers: {
          "Access-Token": TOKEN,
          "Content-Type": "application/json"
        }
      }
    );
    res.send("Event sent to TikTok");
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send("Error sending event");
  }
});

app.listen(3000, () => console.log("TikTok event API listening on port 3000"));
