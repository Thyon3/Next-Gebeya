import User from "@/models/User";
import db from "@/utils/db";
import bcryptjs from "bcryptjs";
import { signToken } from "@/utils/auth";

async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).send({ message: "Method not allowed" });
    }

    await db.connect();

    const user = await User.findOne({
        email: req.body.email,
    });

    if (user && bcryptjs.compareSync(req.body.password, user.password)) {
        const token = signToken(user);
        res.send({
            token,
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            profileImage: user.profileImage,
        });
    } else {
        res.status(401).send({ message: "Invalid email or password" });
    }
}

export default handler;
