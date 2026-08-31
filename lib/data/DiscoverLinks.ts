import { BetweenHorizonalStart, Contact, HandCoins, Info } from 'lucide-react';

export const DiscoverLinks = [
  {
    title: 'More About Us',
    icon: Info,
    description: 'What makes us different',
    image: '/assets/img/stock/teamphoto.jpeg',
    link: '/about',
    isOpen: true,
  },
  {
    title: 'Committee',
    icon: Contact,
    description: 'Get in touch',
    image: '/assets/img/stock/showcase.jpeg',
    link: '/committee',
    isOpen: true,
  },
  {
    title: 'Positions',
    icon: BetweenHorizonalStart,
    description: 'Find what position fits you',
    image: '/assets/img/stock/joinourteam.jpeg',
    link: '/positions',
    isOpen: true,
  },
  {
    title: 'Sponsors',
    icon: HandCoins,
    description: 'People who believe in us',
    image: '/assets/img/stock/events.jpeg',
    link: '/sponsors',
    isOpen: true,
  },
];
