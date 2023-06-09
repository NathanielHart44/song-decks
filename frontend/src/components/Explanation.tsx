import { Typography, Stack, Card, Button } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { NAVBAR } from 'src/config';

// ----------------------------------------------------------------------

export default function Explanation() {

  const info = [
    {
      title: 'Manage Your Tactics Deck From Your Browser',
      text: 'No more forgetting your cards at home!',
    },
    {
      title: 'Provides In-Game Insights',
      text: 'e.g. how many cards are left, how many cards are left in each category, the odds of drawing a particular card',
    },
    {
      title: 'Interact With The Most Up-To-Date Cards',
      text: 'Every card for every Faction and Commander is available, and we\'re constantly updating them as new cards are released.',
    },
    {
      title: 'And Much More to Come!',
      text: 'We\'re still in beta and want your feedback on what to build next!',
    },
    {
      title: 'BUTTON',
      text: 'Create an account and get started!',
    }
  ];
  const card_height_percent = 50;
  const card_width_percent = 75;

  return (
    <>
      <Stack spacing={4} alignItems={'center'} justifyContent={'center'} sx={{ width: '100%', my: '10%' }}>
        <Typography variant={'h5'} paragraph sx={{ textAlign: 'center', mb: 0 }}>
          An unofficial deck management tool for A Song of Ice & Fire: Tabletop Miniatures Game.
        </Typography>

        <Typography variant={'body1'} paragraph sx={{ textAlign: 'center', mb: 0 }}>
          This tool is not affiliated with CMON or Dark Sword Miniatures.
        </Typography>

        <Typography variant={'h6'} sx={{ textAlign: 'center' }}>
          What we're building...
        </Typography>
      </Stack>
      <Stack
        spacing={60}
        alignItems={'center'}
        sx={{ width: '100%', height: '100%', mb: 5 }}
      >
        { info.map((textGroup, index) => (
          <StackCard
            key={index}
            index={index}
            info={info}
            textGroup={textGroup}
            card_height_percent={card_height_percent}
            card_width_percent={card_width_percent}
          />
        ))}
      </Stack>
      
    </>
  );
}

// ----------------------------------------------------------------------

type StackCardProps = {
  index: number;
  info: {
    title: string;
    text: string;
  }[];
  textGroup: {
    title: string;
    text: string;
  };
  card_height_percent: number;
  card_width_percent: number;
};

function StackCard({ index, info, textGroup, card_height_percent, card_width_percent }: StackCardProps) {

  const minHeight = 50;
  const isLastCard = index === info.length - 1;
  const [width, setWidth] = useState<number>(card_width_percent);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      });
    });

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(cardRef.current);
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const visiblePercents = Math.round((rect.bottom / window.innerHeight) * 100);
        let new_width = card_width_percent + visiblePercents * (index * 3) / 100;
        setWidth(new_width);
        if (rect.top <= 0) {
          // scrolling up
          setIsSticky(false);
        } else {
          // scrolling down
          setIsSticky(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    }
  }, [index, card_width_percent, isLastCard]);

  const top_location =
    isLastCard ? `calc(30% + ${((info.length - 2) * 20) - NAVBAR.BASE_HEIGHT}px)`
    : `calc(30% + ${(index * 20) - NAVBAR.BASE_HEIGHT}px)`;

  return (
    <Card
      ref={cardRef}
      sx={{
        ...(textGroup.title !== 'BUTTON' && { p: 2 }),
        width: `${isVisible ? width : 100}%`,
        minHeight: `${minHeight}px`,
        height: `max(${card_height_percent}vh, ${minHeight}px)`,
        position: isSticky ? 'sticky' : 'relative',
        top: top_location,
        justifyContent: 'center',
        alignItems: 'center',
        // ...(text === 'BUTTON' && { bgcolor: 'transparent' })
      }}
    >
        <Stack spacing={1} alignItems={'center'} justifyContent={'center'} sx={{ width: '100%', height: '100%' }}>
          { textGroup.title !== 'BUTTON' &&
            <Typography variant={'h6'} sx={{ textAlign: 'center', mb: 0 }}>
              {textGroup.title}
            </Typography>
          }
          <Typography paragraph sx={{ textAlign: 'center', mb: 0 }}>
            {textGroup.text}
          </Typography>
          { textGroup.title === 'BUTTON' &&
            <Stack alignItems={'center'} justifyContent={'center'} sx={{ width: '50%' }}>
              <Button variant={'contained'} fullWidth>
                Get Started
              </Button>
            </Stack>
          }
        </Stack>
    </Card>
  )
}