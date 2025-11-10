// @ts-expect-error static import
import discordColorLogo from '@/assets/img/icons/discordcolorlogo.png';
// @ts-expect-error static import
import googleFormsLogo from '@/assets/img/icons/googleformslogo.png';
// @ts-expect-error static import
import rubricLogo from '@/assets/img/icons/rubriclogo.png';
// @ts-expect-error static import
import youtubelogo from '@/assets/img/icons/youtubelogo.png';
import { IconMapItem } from '@/types/type';
import { Link, Music, TicketMinus } from 'lucide-react';

const iconMap: Record<string, IconMapItem> = {
  link: { iconComponent: Link },
  youtube: { imagePath: youtubelogo },
  rubric: { imagePath: rubricLogo },
  discord: { imagePath: discordColorLogo },
  googleForms: { imagePath: googleFormsLogo },
  music: { iconComponent: Music },
  ticket: { iconComponent: TicketMinus },
};

export default iconMap;
