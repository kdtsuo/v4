import events from '@/assets/img/stock/events.jpeg';
import joinourteam from '@/assets/img/stock/joinourteam.jpeg';
import showcase from '@/assets/img/stock/showcase.jpeg';
import teamphoto from '@/assets/img/stock/teamphoto.jpeg';
import { getDelayClass } from '@/utils';
import { BetweenHorizonalStart, Contact, HandCoins, Info } from 'lucide-react';
import { DiscoverCard } from '@/components/subcomponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function Discover() {
  const discoverCards = [
    {
      title: 'More About Us',
      icon: Info,
      description: 'What makes us different',
      image: teamphoto,
      link: '/about',
      isOpen: true,
    },
    {
      title: 'Contact Us',
      icon: Contact,
      description: 'Get in touch',
      image: showcase,
      link: '/contacts',
      isOpen: true,
    },
    {
      title: 'Positions',
      icon: BetweenHorizonalStart,
      description: 'Find what position fits you',
      image: joinourteam,
      link: '/positions',
      isOpen: true,
    },
    {
      title: 'Sponsors',
      icon: HandCoins,
      description: 'People who believe in us',
      image: events,
      link: '/sponsors',
      isOpen: true,
    },
  ];

  return (
    <Card className='fade-in-from-bottom mx-4 text-center'>
      <CardHeader>
        <CardTitle>
          <div className='fade-in-from-bottom text-3xl font-bold md:text-6xl'>
            Discover More
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className='flex flex-wrap justify-center gap-6'>
        {/* Cards Container */}
        {discoverCards.map((card, index) => (
          <DiscoverCard
            key={`${card.title}-${index}`}
            title={card.title}
            icon={card.icon}
            description={card.description}
            image={card.image}
            link={card.link}
            isOpen={card.isOpen}
            className={`fade-in-from-bottom aspect-video w-full lg:w-1/3
            ${getDelayClass(index)}`}
          />
        ))}
      </CardContent>
    </Card>
  );
}
