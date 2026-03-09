import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated. Please sign up first.' }, { status: 401 });
    }

    const formData = await request.formData();

    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;
    const streetAddress = formData.get('streetAddress') as string;
    const city = formData.get('city') as string;
    const province = formData.get('province') as string;
    const postalCode = formData.get('postalCode') as string;
    const experienceLevel = formData.get('experienceLevel') as string;
    const yearsExperience = formData.get('yearsExperience') as string;
    const maxWashesPerDay = formData.get('maxWashesPerDay') as string;

    if (!fullName) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const admin = await createAdminClient();

    // Update the profile with washer details
    await admin.from('profiles').upsert({
      id: user.id,
      role: 'washer',
      full_name: fullName,
      email: user.email,
      phone,
    });

    // Create/update washer profile with application details
    await admin.from('washer_profiles').upsert({
      id: user.id,
      status: 'pending',
      bio: `${experienceLevel === 'trained' ? `Trained professional with ${yearsExperience || '2+'} years experience` : 'Eager fresher ready to learn'}. Based in ${city}, ${province}. Can do ${maxWashesPerDay} washes/day.`,
      service_zones: [],
      tools_owned: [],
      vehicle_make: '',
      vehicle_model: '',
      address: `${streetAddress}, ${city}, ${province} ${postalCode}`,
      max_washes_per_day: parseInt(maxWashesPerDay) || 4,
    });

    // Send notification email to admin (if Resend is configured)
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'DRIVEO Applications <onboarding@resend.dev>',
            to: process.env.ADMIN_EMAIL,
            subject: `🚗 New Washer Application: ${fullName}`,
            html: `
              <h2>New Washer Application</h2>
              <p><strong>Name:</strong> ${fullName}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Location:</strong> ${streetAddress}, ${city}, ${province} ${postalCode}</p>
              <p><strong>Experience:</strong> ${experienceLevel === 'trained' ? `Trained (${yearsExperience} years)` : 'Fresher'}</p>
              <p><strong>Max Washes/Day:</strong> ${maxWashesPerDay}</p>
              <p><a href="https://driveo.ca/admin/washers">Review in Admin Dashboard</a></p>
            `,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }
    }

    console.log(`✅ Washer application submitted for ${fullName} (${user.email}) — pending approval`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Application submission error:', error);
    return NextResponse.json({ error: 'Failed to process application' }, { status: 500 });
  }
}
