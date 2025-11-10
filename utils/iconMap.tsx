// Use static public/ paths for images
import { IconMapItem } from '@/types/type';
import { Link, Music, TicketMinus } from 'lucide-react';

const iconMap: Record<string, IconMapItem> = {
  link: { iconComponent: Link },
  youtube: { imagePath: '/assets/img/icons/youtubelogo.png' },
  rubric: { imagePath: '/assets/img/icons/rubriclogo.png' },
  discord: { imagePath: '/assets/img/icons/discordcolorlogo.png' },
  googleForms: { imagePath: '/assets/img/icons/googleformslogo.png' },
  music: { iconComponent: Music },
  ticket: { iconComponent: TicketMinus },
};

export default iconMap;
