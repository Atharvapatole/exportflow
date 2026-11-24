import { NextRequest, NextResponse } from 'next/server';
import { contactRepo } from '@/lib/db';
import { ContactInquiry } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, companyName, category, subject, message, consent } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required fields.' },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { error: 'You must consent to data processing to submit an inquiry.' },
        { status: 400 }
      );
    }

    const categoryMap: Record<string, ContactInquiry['category']> = {
      sales: 'sales',
      support: 'technical',
      custom_plan: 'sales',
      partnership: 'partnership',
      general: 'general',
      billing: 'billing',
      ai: 'ai',
      other: 'other',
    };

    const validCategory = categoryMap[category] || 'general';

    const newInquiry = await contactRepo.createInquiry({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : undefined,
      companyName: companyName ? String(companyName).trim() : undefined,
      category: validCategory,
      subject: String(subject).trim(),
      message: String(message).trim(),
      consentPrivacy: true,
      status: 'new',
    });

    console.log(`[Contact Inquiry Received] ${newInquiry.inquiryNumber} from ${newInquiry.email} (${newInquiry.name}) - ${newInquiry.subject}`);

    // Optional dispatch alert to info@benzwell.in
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'ExportFlow <inquiries@exportflow.in>',
            to: ['info@benzwell.in'],
            subject: `[ExportFlow Inquiry] ${newInquiry.inquiryNumber}: ${newInquiry.subject}`,
            text: `New contact inquiry received:\n\nInquiry: ${newInquiry.inquiryNumber}\nFrom: ${newInquiry.name} <${newInquiry.email}>\nCompany: ${newInquiry.companyName || 'N/A'}\nPhone: ${newInquiry.phone || 'N/A'}\nCategory: ${newInquiry.category}\n\nMessage:\n${newInquiry.message}`,
          }),
        });
      } catch (err) {
        console.warn('Failed to dispatch Resend email alert:', err);
      }
    }

    return NextResponse.json({
      success: true,
      inquiryNumber: newInquiry.inquiryNumber,
      message: 'Your inquiry has been submitted successfully. Our trade specialist team will reply to you within 24 hours.',
    });
  } catch (error: any) {
    console.error('Error submitting contact inquiry:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error processing inquiry.' },
      { status: 500 }
    );
  }
}
