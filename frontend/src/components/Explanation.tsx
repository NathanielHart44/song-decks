import {
  Typography,
  Stack,
  Card,
  Button,
  CardContent,
  Box,
  useTheme,
  IconButton,
  keyframes,
  Dialog,
  DialogContent
} from '@mui/material';
import { createRef, useContext, useEffect, useState } from 'react';
import { NAVBAR } from 'src/config';
import Iconify from './Iconify';
import { useNavigate } from 'react-router-dom';
import { PATH_AUTH } from 'src/routes/paths';
import { MetadataContext } from 'src/contexts/MetadataContext';

// ----------------------------------------------------------------------

export default function Explanation() {

  const theme = useTheme();
  const { isMobile } = useContext(MetadataContext);

  const info = [
    {
      title: 'Manage Your Tactics Deck From Your Browser',
      text: 'No more forgetting your cards at home!',
      image: ['/images/example_1.png'],
    },
    {
      title: 'Built First For Mobile',
      text: 'Designed to be used on your phone or tablet while playing.',
      image: ['/images/example_4.png'],
    },
    {
      title: 'Provides In-Game Insights',
      text: 'The odds of drawing a certain card, how many cards are left, and more!',
      image: ['/images/example_3.png'],
    },
    {
      title: 'Interact With The Most Up-To-Date Cards',
      text: 'Every card for every Faction and Commander is available, and we\'re constantly updating them as new cards are released.',
      image: ['/images/example_2.png'],
    },
    {
      title: 'Designed To Be Flexible',
      text: 'Features such as leaving notes on your cards enable you to use ASOIAF Decks however you need!',
      image: ['/images/example_5.png'],
    },
    {
      title: 'And Much More to Come!',
      text: 'We\'re still working to add new features and make this a useful tool for the community. We want your feedback on what to build next!',
      image: [],
    },
    {
      title: 'Sign Up',
      text: 'Create an account and get started!',
      image: [],
    }
  ];
  const card_height_percent = isMobile ? 60 : 50;
  const card_width_percent = isMobile ? 90 : 75;
  const card_spacing = 60;
  const cardRefs = info.map(() => createRef<HTMLDivElement>());

  const handleScrollClick = (index: number) => {
    window.scrollTo({
      top: window.innerHeight * (index + 1),
      behavior: 'smooth',
    });
  };

  return (
    <>
      <Stack spacing={4} alignItems={'center'} justifyContent={'center'} sx={{ width: '100%', height: isMobile ? '80vh' : '90vh' }}>
        <Stack spacing={4} alignItems={'center'} justifyContent={'center'} sx={{ width: '100%' }}>
          <Typography variant={'h2'} paragraph sx={{ textAlign: 'center', mb: 0 }}>
            Welcome to ASOIAF Decks!
          </Typography>
          <Typography paragraph sx={{ textAlign: 'center', mb: 0 }}>
            An unofficial deck management tool for A Song of Ice & Fire: Tabletop Miniatures Game.
          </Typography>
        </Stack>

        <Stack spacing={1} alignItems={'center'} justifyContent={'center'} sx={{ width: '100%' }}>
          <Typography sx={{ textAlign: 'center' }}>
            What we're building...
          </Typography>
          <IconButton
            size="large"
            color="inherit"
            onClick={() => { handleScrollClick(0) }}
          >
            <Iconify
              icon={'eva:arrow-ios-downward-outline'}
              width={30}
              height={30}
              color={theme.palette.primary.main}
              sx={{ animation: `${getPulse()} 2s ease-in-out infinite` }}
            />
          </IconButton>
        </Stack>
      </Stack>

      <Stack
        spacing={card_spacing}
        alignItems={'center'}
        sx={{ width: '100%', height: '100%' }}
      >
        { info.map((textGroup, index) => (
          <StackCard
            key={index}
            index={index}
            isMobile={isMobile}
            cardRef={cardRefs[index]}
            info={info}
            textGroup={textGroup}
            card_height_percent={card_height_percent}
            card_width_percent={card_width_percent}
            card_spacing={card_spacing}
          />
        ))}
      </Stack>
      
    </>
  );
}

// ----------------------------------------------------------------------

type StackCardProps = {
  index: number;
  isMobile: boolean;
  cardRef: React.RefObject<HTMLDivElement>;
  info: {
    title: string;
    text: string;
    image: string[];
  }[];
  textGroup: {
    title: string;
    text: string;
    image: string[];
  };
  card_height_percent: number;
  card_width_percent: number;
  card_spacing: number;
};

function StackCard({ index, isMobile, cardRef, info, textGroup, card_height_percent, card_width_percent, card_spacing }: StackCardProps) {

  const theme = useTheme();
  const navigate = useNavigate();
  const minHeight = isMobile ? 30 : 50;
  const isLastCard = index === info.length - 1;
  const [width, setWidth] = useState<number>(card_width_percent);
  const [isSticky, setIsSticky] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [popUpOpen, setPopUpOpen] = useState(false);

  const handleClick = () => { setPopUpOpen(!popUpOpen) };

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const visiblePercents = Math.round((rect.bottom / window.innerHeight) * 100);
        let new_width = card_width_percent + visiblePercents * (index * 2) / 100;
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
  }, [index, card_width_percent, isLastCard, cardRef]);

  const top_location =
    isLastCard ? `calc(30% + ${((info.length - 2) * 20) - (isMobile ? (NAVBAR.BASE_HEIGHT + 20) : NAVBAR.BASE_HEIGHT)}px)`
    : `calc(30% + ${(index * 20) - (isMobile ? (NAVBAR.BASE_HEIGHT + 40) : NAVBAR.BASE_HEIGHT)}px)`;

  const flexDirection = index % 2 === 0 ? 'row' : 'row-reverse';

  const handleScrollClick = (index: number) => {
    if (!cardRef.current) return;
    const cardHeight = cardRef.current.offsetHeight;
    const stackSpacing = theme.spacing(card_spacing);
    const scrollPosition = (cardHeight * (index + 1)) + (parseInt(stackSpacing) * (index + 1));
  
    window.scrollTo({
      top: scrollPosition,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <Card
        ref={cardRef}
        sx={{
          // p: 2,
          width: `${isVisible ? width : 100}%`,
          minHeight: `${minHeight}px`,
          height: `max(${card_height_percent}vh, ${minHeight}px)`,
          position: isSticky ? 'sticky' : 'relative',
          top: top_location,
          justifyContent: 'center',
          alignItems: 'center',
          border: `1px solid ${theme.palette.primary.darker}`,
        }}
      >
          { !isLastCard &&
            <IconButton
              sx={{
                position: 'absolute',
                bottom: 0,
                left: `calc(50% - ${30}px)`,
              }}
              size="large"
              color="inherit"
              onClick={() => { handleScrollClick(index + 1) }}
            >
              <Iconify
                icon={'eva:arrow-ios-downward-outline'}
                width={30}
                height={30}
                color={theme.palette.primary.main}
                sx={{ animation: `${getPulse()} 2s ease-in-out infinite` }}
              />
            </IconButton>
          }
        <CardContent sx={{ py: 0, px: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : flexDirection,
            }}
          >
            <Stack spacing={6} alignItems={'center'} justifyContent={'center'} sx={{ width: '100%', height: '100%' }}>
              { textGroup.title !== 'BUTTON' &&
                <Typography variant={'h5'} sx={{ textAlign: 'center', mb: 0 }}>
                  {textGroup.title}
                </Typography>
              }
              <Typography paragraph sx={{ textAlign: 'center', mb: 0 }}>
                {textGroup.text}
              </Typography>
              { textGroup.title === 'Sign Up' &&
                <Stack alignItems={'center'} justifyContent={'center'} sx={{ width: '50%' }}>
                  <Button variant={'contained'} fullWidth onClick={() => { navigate(PATH_AUTH.register) }}>
                    Get Started
                  </Button>
                </Stack>
              }
            </Stack>

            { textGroup.image.length === 1 &&
              <CardContent
                onClick={handleClick}
                sx={{
                  cursor: 'pointer',
                  ...(!isMobile && {
                    py: 0,
                    pl: index % 2 === 0 ? 1 : 0,
                    pr: index % 2 === 0 ? 0 : 1
                  }),
                }}
              >
                <img
                  src={textGroup.image[0]}
                  alt={`Example ${index+1}`}
                  style={{
                      height: `max(${card_height_percent * (isMobile ? 0.4 : 0.6)}vh, ${minHeight}px)`,
                      border: `1px solid ${theme.palette.grey.default_canvas}`,
                      borderRadius: '6px',
                      objectFit: 'cover',
                      width: '100%',
                  }}
                  loading="lazy"
                />
                <Popup
                  image={textGroup.image[0]}
                  open={popUpOpen}
                  handleClose={handleClick}
                />
              </CardContent>
            }
          </Box>
        </CardContent>
      </Card>
    </>
  )
}

// ----------------------------------------------------------------------

type PopupProps = {
  image: string;
  open: boolean;
  handleClose: () => void;
};

export function Popup({ image, open, handleClose }: PopupProps) {

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={'lg'}
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: 'transparent',
          boxShadow: 'none',
        },
      }}
    >
      <DialogContent onClick={handleClose}>
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          <img
            src={image}
            alt={'Example'}
            style={{
              width: '100%',
              maxHeight: '100vh',
              objectFit: 'contain',
            }}
            loading="lazy"
          />
        </Box>
      </DialogContent>
    </Dialog>
  )
}

// ----------------------------------------------------------------------

function getPulse() {
  return keyframes({
    '0%': {
      transform: 'scale(0.9)',
      opacity: 1,
    },
    '50%': {
      transform: 'scale(1.1)',
      opacity: 0.65,
    },
    '100%': {
      transform: 'scale(0.9)',
      opacity: 1,
    },
  });
};