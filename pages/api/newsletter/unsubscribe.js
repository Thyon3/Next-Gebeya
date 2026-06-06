import Newsletter from "@/models/Newsletter";
import db from "@/utils/db";

async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { token } = req.query;

  if (!token) {
    return res.status(422).json({ message: "Unsubscribe token is required" });
  }

  await db.connect();

  try {
    const subscriber = await Newsletter.findOne({ unsubscribeToken: token });

    if (!subscriber) {
            return res.status(404).json({ message: "Subscription not found" });
    }

    if (!subscriber.isActive) {
            return res.status(400).json({ message: "Already unsubscribed" });
    }

    subscriber.isActive = false;
    await subscriber.save();

    
    // Redirect to a confirmation page or return success
    if (req.method === "GET") {
      res.redirect("/unsubscribe?success=true");
    } else {
      res.status(200).json({ message: "Successfully unsubscribed from newsletter" });
    }
  } catch (error) {
        console.error('Unsubscribe error:', error);
    res.status(500).json({ message: "Error unsubscribing. Please try again." });
  }
}

export default handler;
