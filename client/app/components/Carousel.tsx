"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CarouselSlide {
  id?: string | number;
  image: string;
  title: string;
  description?: string;
}

const DEFAULT_SLIDES: CarouselSlide[] = [
  {
    id: 1,
    image: 'https://picsum.photos/id/1018/1200/600',
    title: 'First slide',
  },
  {
    id: 2,
    image: 'https://picsum.photos/id/1015/1200/600',
    title: 'Second slide',
  },
  {
    id: 3,
    image: 'https://picsum.photos/id/1019/1200/600',
    title: 'Third slide',
  },
];

interface CarouselProps {
  slides?: CarouselSlide[];
  autoPlay?: boolean;
  speed?: number;
}

export default function Carousel({
  slides = DEFAULT_SLIDES,
  autoPlay = true,
  speed = 3000,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!autoPlay || isPaused || slides.length <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, speed);

    return () => clearInterval(timer);
  }, [autoPlay, isPaused, speed, nextSlide, slides.length]);

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides track */}
      <div
        className="flex h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={slide.id || index} className="relative min-w-full h-full flex-shrink-0">
            <img
              src={slide.image}
              alt={slide.title || `Slide ${index + 1}`}
              className="h-full w-full object-cover"
            />
            {(slide.title || slide.description) && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-center">
                {slide.title && (
                  <span className="text-2xl sm:text-4xl text-white font-bold drop-shadow-md">
                    {slide.title}
                  </span>
                )}
                {slide.description && (
                  <p className="mt-2 text-sm sm:text-base text-gray-200 drop-shadow">
                    {slide.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Prev / Next navigation buttons */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Pagination dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none ${
                currentIndex === index
                  ? 'w-8 bg-white'
                  : 'w-2.5 bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
