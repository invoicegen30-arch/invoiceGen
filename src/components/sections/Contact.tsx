'use client';

import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Section id="contact" className="py-14">
      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold">Contact us</h2>
          <p className="mt-2 text-slate-600">Leave a message - we'll reply within one business day.</p>
          <div className="mt-6 grid gap-3 text-sm text-slate-700">
            <div>Company: GET STUFFED LTD</div>
            <div>Reg: 15673179</div>
            <div>Address: Flat 21 County Chambers, 1 Drapery, Northampton, United Kingdom, NN1 2ET</div>
            <div>Email: info@invoicerly.co.uk</div>
            <div>Phone: +44 7537 103023</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Card>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Name"
                name="name"
                placeholder="Alex Johnson"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <div className="sm:col-span-2">
                <Textarea
                  label="Message"
                  name="message"
                  rows={5}
                  placeholder="Tell us about your use case..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" className="w-full" size="lg">
                  Send
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </Section>
  );
}




