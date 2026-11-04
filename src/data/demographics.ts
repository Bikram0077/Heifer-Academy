import type { Bi } from '@shared/schema'

export const roles: { id: string; label: Bi }[] = [
  { id: 'farmer', label: { en: 'Farmer', ne: 'किसान' } },
  { id: 'shg', label: { en: 'SHG Member', ne: 'स्वावलम्बन समूह सदस्य' } },
  { id: 'facilitator', label: { en: 'Facilitator', ne: 'सहजकर्ता' } },
  { id: 'student', label: { en: 'Student', ne: 'विद्यार्थी' } },
]

export const genders: { id: string; label: Bi }[] = [
  { id: 'woman', label: { en: 'Woman', ne: 'महिला' } },
  { id: 'man', label: { en: 'Man', ne: 'पुरुष' } },
  { id: 'other', label: { en: 'Other', ne: 'अन्य' } },
  { id: 'na', label: { en: 'Prefer not to say', ne: 'भन्न चाहन्नँ' } },
]

export const provinces: { name: Bi; districts: string[] }[] = [
  { name: { en: 'Koshi', ne: 'कोशी' }, districts: ['Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang', 'Okhaldhunga', 'Panchthar', 'Sankhuwasabha', 'Solukhumbu', 'Sunsari', 'Taplejung', 'Terhathum', 'Udayapur'] },
  { name: { en: 'Madhesh', ne: 'मधेश' }, districts: ['Bara', 'Dhanusha', 'Mahottari', 'Parsa', 'Rautahat', 'Saptari', 'Sarlahi', 'Siraha'] },
  { name: { en: 'Bagmati', ne: 'बागमती' }, districts: ['Bhaktapur', 'Chitwan', 'Dhading', 'Dolakha', 'Kathmandu', 'Kavrepalanchok', 'Lalitpur', 'Makwanpur', 'Nuwakot', 'Ramechhap', 'Rasuwa', 'Sindhuli', 'Sindhupalchok'] },
  { name: { en: 'Gandaki', ne: 'गण्डकी' }, districts: ['Baglung', 'Gorkha', 'Kaski', 'Lamjung', 'Manang', 'Mustang', 'Myagdi', 'Nawalpur', 'Parbat', 'Syangja', 'Tanahun'] },
  { name: { en: 'Lumbini', ne: 'लुम्बिनी' }, districts: ['Arghakhanchi', 'Banke', 'Bardiya', 'Dang', 'Eastern Rukum', 'Gulmi', 'Kapilvastu', 'Palpa', 'Parasi', 'Pyuthan', 'Rolpa', 'Rupandehi'] },
  { name: { en: 'Karnali', ne: 'कर्णाली' }, districts: ['Dailekh', 'Dolpa', 'Humla', 'Jajarkot', 'Jumla', 'Kalikot', 'Mugu', 'Salyan', 'Surkhet', 'Western Rukum'] },
  { name: { en: 'Sudurpashchim', ne: 'सुदूरपश्चिम' }, districts: ['Achham', 'Baitadi', 'Bajhang', 'Bajura', 'Dadeldhura', 'Darchula', 'Doti', 'Kailali', 'Kanchanpur'] },
]

