'use client';

import * as React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-metallic-900/80 backdrop-blur-sm border border-metallic-700 rounded-xl shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className = '', children, ...props }: CardHeaderProps) {
  return (
    <div
      className={`p-6 border-b border-metallic-700/50 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className = '', children, ...props }: CardTitleProps) {
  return (
    <h3
      className={`text-lg font-semibold text-metallic-100 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ className = '', children, ...props }: CardDescriptionProps) {
  return (
    <p
      className={`text-sm text-metallic-400 mt-1 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className = '', children, ...props }: CardContentProps) {
  return (
    <div
      className={`p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className = '', children, ...props }: CardFooterProps) {
  return (
    <div
      className={`p-6 pt-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
