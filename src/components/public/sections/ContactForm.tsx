"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const contactSchema = z.object({
  firstname: z.string().min(2, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export interface ContactFormProps {
  eyebrow: string;
  heading: string;
  highlight: string;
  description: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  eyebrow,
  heading,
  highlight,
  description
}) => {
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/leads/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setStatus({ type: 'success', message: "Your message has been sent successfully!" });
        reset();
      } else {
        throw new Error("Failed to send message");
      }
    } catch {
      setStatus({ type: 'error', message: "Something went wrong. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-form-wrap row-gap">
      <div className="section-heading mb-40">
        <h3 className="sub-heading is-border border-anim">
          {eyebrow}<span className="sh-underline"><img className="sh-truck" src="/img/truck.svg" alt="truck" /></span>
        </h3>
        <h2 className="text-anim">
          {heading} <span className="hl">{highlight}</span>
        </h2>
        <p className="text-anim">
          {description}
        </p>
      </div>
      <div className="contact-form">
        <form onSubmit={handleSubmit(onSubmit)} className="form-horizontal">
          <div className="contact-form-group">
            <div className="form-field">
              <input
                {...register("firstname")}
                type="text"
                className={`form-control ${errors.firstname ? 'is-invalid' : ''}`}
                placeholder="First Name"
              />
              {errors.firstname && <div className="invalid-feedback">{errors.firstname.message}</div>}
            </div>
            <div className="form-field">
              <input
                {...register("lastname")}
                type="text"
                className={`form-control ${errors.lastname ? 'is-invalid' : ''}`}
                placeholder="Last Name"
              />
              {errors.lastname && <div className="invalid-feedback">{errors.lastname.message}</div>}
            </div>
            <div className="form-field">
              <input
                {...register("email")}
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="Email"
              />
              {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
            </div>
            <div className="form-field">
              <input
                {...register("phone")}
                type="text"
                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                placeholder="Phone Number"
              />
              {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
            </div>
            <div className="form-field message">
              <textarea
                {...register("message")}
                cols={30}
                rows={4}
                className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                placeholder="Message"
              ></textarea>
              {errors.message && <div className="invalid-feedback">{errors.message.message}</div>}
            </div>
            <div className="form-field submit-btn">
              <button className="default-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>
          {status.message && (
            <div className={`ajax-form-msg alert mt-3 ${status.type === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert">
              {status.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
