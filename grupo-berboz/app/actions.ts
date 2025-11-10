'use server'; // Magia de Next.js: esto solo se ejecuta en el servidor

import { z } from 'zod';
import { Resend } from 'resend';

// Inicializa Resend con la API key que guardaste
const resend = new Resend(process.env.RESEND_API_KEY);

// 1. Define cómo deben ser los datos del formulario
const FormSchema = z.object({
  name: z.string().min(2, { message: 'Tu nombre es muy corto.' }),
  email: z.string().email({ message: 'Por favor, ingresa un email válido.' }),
  message: z.string().min(5, { message: 'Tu mensaje es muy corto.' }),
});

// 2. Esta es la función que llamará el formulario
export async function sendContactMessage(prevState: any, formData: FormData) {
  // 3. Valida los datos usando el schema (zod)
  const validatedFields = FormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  // 4. Si la validación falla, devuelve los errores
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { name, email, message } = validatedFields.data;

  // 5. Si todo está bien, envía el email
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev', // Requerido por Resend en el plan gratis
      to: 'adrian13759@gmail.com', // <-- EL EMAIL DE TU PRIMO
      subject: `Nuevo Mensaje de Contacto de: ${name}`,
      html: `
        <p><strong>De:</strong> ${name} (${email})</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    // Devuelve un mensaje de éxito
    return { message: '¡Mensaje enviado con éxito!' };
  } catch (error) {
    // Devuelve un mensaje de error
    return { errors: { api: 'Error al enviar el mensaje. Intenta más tarde.' } };
  }
}