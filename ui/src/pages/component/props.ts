export interface BookProps {
  name: string;
  description: string;
  author: string;
  year: number;
}

export interface StartupProps {
  name: string;
  description: string;
  alt: string;
  city: string;
  images: string;
  link: string;
}

export interface QNAProps {
  question: string;
  answer?: string;
}
