export const contactUs = (
  message: string,
  name: string,
  phone: string,
  email: string
): string => {
  return `From: ${name} <br> 
  Email: <a href="mailto:${email}">${email}</a>  <br> 
  Phone: <a href="tel:${phone}">${phone}</a> <br> 
  Message: ${message}`;
};
