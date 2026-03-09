import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;
    const streetAddress = formData.get('streetAddress') as string;
    const city = formData.get('city') as string;
    const province = formData.get('province') as string;
    const postalCode = formData.get('postalCode') as string;
    const experienceLevel = formData.get('experienceLevel') as string;
    const yearsExperience = formData.get('yearsExperience') as string;
    const maxWashesPerDay = formData.get('maxWashesPerDay') as string;

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // 1. Create Supabase auth user with washer role
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      phone: phone || undefined,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: 'washer' },
    });

    if (authError || !authData.user) {
      console.error('Auth creation error:', authError);
      return NextResponse.json(
        { error: authError?.message || 'Failed to create account' },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // 2. Create base profile
    await supabase.from('profiles').insert({
      id: userId,
      role: 'washer',
      full_name: fullName,
      email,
      phone,
    });

    // 3. Create washer profile with application details
    await supabase.from('washer_profiles').insert({
      id: userId,
      status: 'pending',
      bio: `${experienceLevel === 'trained' ? `Trained professional with ${yearsExperience || '2+'} years experience` : 'Eager fresher ready to learn'}. Based in ${city}, ${province}. Can do ${maxWashesPerDay} washes/day.`,
      service_zones: [],
      tools_owned: [],
      vehicle_make: '',
      vehicle_model: '',
      address: `${streetAddress}, ${city}, ${province} ${postalCode}`,
      max_washes_per_day: parseInt(maxWashesPerDay) || 4,
    });

    // 4. Send notification email to admin (if Resend is configured)
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
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Location:</strong> ${streetAddress}, ${city}, ${province} ${postalCode}</p>
              <p><strong>Experience:</strong> ${experienceLevel === 'trained' ? `Trained (${yearsExperience} years)` : 'Fresher'}</p>
              <p><strong>Max Washes/Day:</strong> ${maxWashesPerDay}</p>
              <p><strong>Account created:</strong> Yes (pending approval)</p>
              <p><a href="https://driveo.ca/admin/washers">Review in Admin Dashboard</a></p>
            `,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }
    }

    console.log(`✅ Washer account created for ${fullName} (${email}) — pending approval`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Application submission error:', error);
    return NextResponse.json({ error: 'Failed to process application' }, { status: 500 });
  }
}
