// src/components/BaseControl/Carousel.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button, Carousel, Grid } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import type { CarouselProps, GetRef } from "antd";

export interface BaseControlCarouselProps extends CarouselProps {
  totalItemsPerSlide?: number;
  slideStyle?: React.CSSProperties;
  classItemStyle?: string;
  isShowFooter?: boolean;
}

type CarouselRef = GetRef<typeof Carousel>;

const BaseControlCarousel: React.FC<BaseControlCarouselProps> = ({
  children,
  totalItemsPerSlide = 3,
  slideStyle,
  classItemStyle,
  isShowFooter = false,
  afterChange: userAfterChange,
  ...carouselProps
}) => {
  const [mounted, setMounted] = useState(false);
  const [current, setCurrent] = useState(0);
  const carouselRef = useRef<CarouselRef>(null);

  // Lấy thông tin breakpoint của AntD
  const { sm, md, lg, xl, xxl } = Grid.useBreakpoint();

  // Tùy chỉnh số items theo breakpoint
  let bpItems: number;
  if (xxl || xl || lg) {
    bpItems = totalItemsPerSlide; // 3 trên desktop rộng
  } else if (md || sm) {
    bpItems = 2; // 2 trên tablet và desktop nhỏ
  } else {
    bpItems = 1; // 1 trên mobile
  }
  // Chuyển children thành mảng
  const items = React.Children.toArray(children);
  // Giới hạn itemsPerPage không vượt quá tổng items có sẵn
  const itemsPerPage = Math.min(bpItems, items.length);

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  // Chia slide
  const slides: React.ReactNode[][] = [];
  for (let i = 0; i < items.length; i += itemsPerPage) {
    slides.push(items.slice(i, i + itemsPerPage));
  }

  const goTo = (idx: number) => {
    carouselRef.current?.goTo(idx, false);
    setCurrent(idx);
  };

  return (
    <div className={`relative ${isShowFooter ? "pb-14" : ""}`}>
      <Carousel
        ref={carouselRef}
        afterChange={(idx) => {
          setCurrent(idx);
          userAfterChange?.(idx);
        }}
        {...carouselProps}
      >
        {slides.map((slideItems, i) => (
          <div key={i} style={slideStyle}>
            <div className="flex gap-4 justify-center">
              {slideItems.map((child, j) => (
                <div key={j} className={classItemStyle}>
                  {child}
                </div>
              ))}
            </div>
          </div>
        ))}
      </Carousel>

      {/* Nút điều khiển */}
      {isShowFooter ? (
        <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
          <Button
            onClick={() => goTo(Math.max(0, current - 1))}
            disabled={current === 0}
            className="!w-10 !h-10 !rounded-lg !bg-teal-400 !border-none disabled:opacity-50"
            icon={<LeftOutlined className="!text-white" />}
          />
          <Button
            onClick={() => goTo(Math.min(slides.length - 1, current + 1))}
            disabled={current === slides.length - 1}
            className="!w-10 !h-10 !rounded-lg !bg-teal-400 !border-none disabled:opacity-50"
            icon={<RightOutlined className="!text-white" />}
          />
        </div>
      ) : (
        <>
          <Button
            onClick={() => goTo(Math.max(0, current - 1))}
            disabled={current === 0}
            className="!absolute !top-1/2 !left-2 !-translate-y-1/2 !w-10 !h-10 !rounded-lg !bg-teal-400 !border-none disabled:opacity-50"
            icon={<LeftOutlined className="!text-white" />}
          />
          <Button
            onClick={() => goTo(Math.min(slides.length - 1, current + 1))}
            disabled={current === slides.length - 1}
            className="!absolute !top-1/2 !right-2 !-translate-y-1/2 !w-10 !h-10 !rounded-lg !bg-teal-400 !border-none disabled:opacity-50"
            icon={<RightOutlined className="!text-white" />}
          />
        </>
      )}
    </div>
  );
};

export default BaseControlCarousel;
