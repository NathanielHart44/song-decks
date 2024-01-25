import Slider from 'react-slick';
import { useState, useRef } from 'react';
// @mui
import { alpha, useTheme, styled } from '@mui/material/styles';
import { CardContent, Box, Card, Typography, CardMedia } from '@mui/material';
// components

import { LandingPageInfo } from 'src/pages/LandingPage';
import CarouselArrows from './CarouselArrows';
import CarouselDots from './CarouselDots';
import MotionContainer from '../animate/MotionContainer';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// ----------------------------------------------------------------------

const OverlayStyle = styled('div')(({ theme }) => ({
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 8,
  position: 'absolute',
  backgroundColor: alpha(theme.palette.grey[900], 0.64),
}));

// ----------------------------------------------------------------------

type Props = {
  items: LandingPageInfo[];
}

export default function AppFeatured({ items }: Props) {
  const theme = useTheme();
  const carouselRef = useRef<Slider>(null);
  const [currentIndex, setCurrentIndex] = useState(
    theme.direction === 'rtl' ? items.length - 1 : 0
  );

  const settings = {
    autoPlaySpeed: 5000,
    autoplay: true,
    speed: 1500,
    dots: true,
    arrows: false,
    fade: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    rtl: Boolean(theme.direction === 'rtl'),
    beforeChange: (current: number, next: number) => setCurrentIndex(next),
    ...CarouselDots({
      zIndex: 9,
      top: 24,
      left: 24,
      position: 'absolute',
    }),
  };

  const handlePrevious = () => {
    carouselRef.current?.slickPrev();
  };

  const handleNext = () => {
    carouselRef.current?.slickNext();
  };

  return (
    <Card sx={{ width: '100%' }}>

      <Slider ref={carouselRef} {...settings}>
        {items.map((item, index) => (
          <CarouselItem key={item.title + `_${index}`} item={item} isActive={index === currentIndex} />
        ))}
      </Slider>

      <CarouselArrows
        onNext={handleNext}
        onPrevious={handlePrevious}
        spacing={0}
        sx={{
          top: 16,
          right: 16,
          position: 'absolute',
          '& .arrow': {
            p: 0,
            width: 32,
            height: 32,
            opacity: 0.48,
            color: 'common.white',
            '&:hover': { color: 'common.white', opacity: 1 },
          },
        }}
      />
    </Card>
  );
}

// ----------------------------------------------------------------------

type CarouselItemProps = {
  item: LandingPageInfo;
  isActive?: boolean;
};

function CarouselItem({ item, isActive }: CarouselItemProps) {
  const { title, text, image } = item;

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {image[0] ?
        <CardMedia
          component="img"
          image={image[0]}
          alt={title}
          sx={{
            height: { xs: 280, xl: 320 },
            objectFit: 'cover',
          }}
        /> :
        <Box sx={{ height: { xs: 280, xl: 320 } }} />
      }
      <CardContent
        component={MotionContainer}
        animate={isActive}
        action
        sx={{
          bottom: 0,
          width: '100%',
          zIndex: 9,
          textAlign: 'left',
          position: 'absolute',
          backgroundColor: (theme) => alpha(theme.palette.grey[900], 0.72),
        }}
      >
        {/* <m.div variants={varFade().inRight}> */}
          <Typography variant="h5" gutterBottom>
            {title}
          </Typography>
        {/* </m.div> */}
        {/* <m.div variants={varFade().inRight}> */}
          <Typography variant="body2">
            {text}
          </Typography>
        {/* </m.div> */}
      </CardContent>
      <OverlayStyle />
    </Box>
  );
}