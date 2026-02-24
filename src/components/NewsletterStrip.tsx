"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const NewsletterStrip = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({ title: "Subscribed!", description: "You'll receive the latest UAE real estate updates." });
      setEmail("");
    }
  };

  return (
    <section className="bg-accent py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
        >
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-accent-foreground/20 flex items-center justify-center">
              <Mail className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="font-bold text-accent-foreground text-sm">Subscribe to Our Newsletter</p>
              <p className="text-accent-foreground/70 text-xs">Latest UAE real estate updates</p>
            </div>
          </div>
          <div className="flex flex-1 w-full sm:w-auto gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-accent-foreground/15 border border-accent-foreground/20 rounded-xl px-4 py-3 text-sm text-accent-foreground placeholder:text-accent-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent-foreground/30"
              required
            />
            <button type="submit" className="bg-foreground hover:bg-foreground/90 text-background px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 flex-shrink-0">
              Subscribe
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  );
};

export default NewsletterStrip;
