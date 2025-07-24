import users from "../Models/Auth.js"
import jwt from "jsonwebtoken"
import { sendInvoiceEmail } from "../Helper/email.js";

const PLAN_LIMITS = {
    free: { minutes: 5, price: 0 },
    bronze: { minutes: 7, price: 10 },
    silver: { minutes: 10, price: 50 },
    gold: { minutes: Infinity, price: 100 }
};

export const login = async (req, res) => {
    const { email } = req.body;
    // console.log(email)
    try {
        const extinguser = await users.findOne({ email })
        if (!extinguser) {
            try {
                const newuser = await users.create({ email });
                const token = jwt.sign({
                    email: newuser.email, id: newuser._id
                }, process.env.JWT_SECERT, {
                    expiresIn: "1h"
                }
                )
                res.status(200).json({ result: newuser, token })
            } catch (error) {
                res.status(500).json({ mess: "something went wrong..." })
                return
            }

        } else {
            const token = jwt.sign({
                email: extinguser.email, id: extinguser._id
            }, process.env.JWT_SECERT, {
                expiresIn: "1h"
            }
            )
            res.status(200).json({ result: extinguser ,token})
        }
    } catch (error) {
        res.status(500).json({ mess: "something went wrong..." })
        return
    }
}

export const upgradePlan = async (req, res) => {
    const { userId, plan } = req.body;
    if (!['bronze', 'silver', 'gold'].includes(plan)) {
        return res.status(400).json({ message: 'Invalid plan selected.' });
    }
    try {
        const user = await users.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        // Mock payment success
        const price = PLAN_LIMITS[plan].price;
        // Set plan expiry (30 days from now for paid plans)
        const expiry = plan === 'gold' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        user.plan = plan;
        user.planExpiry = expiry;
        await user.save();
        // Send invoice email
        await sendInvoiceEmail(user.email, plan, price);
        res.status(200).json({ message: 'Plan upgraded successfully!', plan, price });
    } catch (error) {
        res.status(500).json({ message: 'Upgrade failed', error: error.message });
    }
}