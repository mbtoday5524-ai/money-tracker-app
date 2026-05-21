import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from 'resend';

// Lazy initialization of Resend
let resend: Resend | null = null;
const getResend = () => {
  if (!resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.warn('RESEND_API_KEY environment variable is not set. Email notifications will be skipped.');
      return null;
    }
    resend = new Resend(key);
  }
  return resend;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for notifications
  app.post("/api/notify", async (req, res) => {
    const { email, type, data } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const client = getResend();
    if (!client) {
      return res.status(503).json({ error: "Email service not configured" });
    }

    try {
      let subject = "";
      let html = "";

      if (type === "NEW_TRANSACTION") {
        subject = `New Transaction: ${data.category} (${data.type})`;
        html = `
          <div style="font-family: sans-serif; padding: 20px; color: #334155;">
            <h2 style="color: #4f46e5;">New Transaction Recorded</h2>
            <p>A new transaction has been added to your ledger.</p>
            <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p><strong>Date:</strong> ${data.date}</p>
              <p><strong>Wallet:</strong> ${data.category}</p>
              <p><strong>Type:</strong> ${data.type.toUpperCase()}</p>
              <p><strong>Amount:</strong> ${data.amount.toLocaleString()}</p>
              <p><strong>Fee:</strong> ${data.fee.toLocaleString()}</p>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">This is an automated notification from Money Tracker MM.</p>
          </div>
        `;
      } else if (type === "LOW_BALANCE") {
        subject = `⚠️ Low Balance Alert: ${data.wallet}`;
        html = `
          <div style="font-family: sans-serif; padding: 20px; color: #334155;">
            <h2 style="color: #e11d48;">Low Balance Warning</h2>
            <p>Your wallet balance has dropped below the set threshold.</p>
            <div style="background-color: #fff1f2; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #e11d48;">
              <p><strong>Wallet:</strong> ${data.wallet}</p>
              <p><strong>Current Balance:</strong> ${data.balance.toLocaleString()}</p>
              <p><strong>Threshold:</strong> ${data.threshold.toLocaleString()}</p>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">Please consider topping up your ${data.wallet} wallet soon.</p>
          </div>
        `;
      }

      await client.emails.send({
        from: 'Money Tracker <onboarding@resend.dev>',
        to: email,
        subject: subject,
        html: html,
      });

      res.json({ success: true });
    } catch (err: any) {
      console.error("Failed to send email:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
