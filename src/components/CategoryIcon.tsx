import React from 'react';
import {
  Utensils,
  Home,
  Car,
  HeartPulse,
  Palmtree,
  GraduationCap,
  ShoppingBag,
  HelpCircle,
  Briefcase,
  Laptop,
  TrendingUp,
  RotateCcw,
  Coins,
  Zap,
  CreditCard,
  WalletCards,
  Banknote,
  ArrowLeftRight,
  FileText,
  Tag,
  CircleDollarSign,
  Plane,
  Shield,
  PiggyBank,
  Sparkles,
  Gift,
  Building,
  Smartphone,
  Tv,
  Coffee,
  type LucideProps
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const AVAILABLE_ICONS = [
  { name: 'Utensils', label: 'Alimentação' },
  { name: 'Home', label: 'Moradia' },
  { name: 'Car', label: 'Transporte / Carro' },
  { name: 'HeartPulse', label: 'Saúde' },
  { name: 'Palmtree', label: 'Lazer' },
  { name: 'GraduationCap', label: 'Educação' },
  { name: 'ShoppingBag', label: 'Compras' },
  { name: 'Briefcase', label: 'Trabalho / Salário' },
  { name: 'Laptop', label: 'Tecnologia / Freelance' },
  { name: 'TrendingUp', label: 'Investimentos' },
  { name: 'RotateCcw', label: 'Reembolso' },
  { name: 'Coins', label: 'Moedas / Extras' },
  { name: 'Zap', label: 'Pix / Energia' },
  { name: 'CreditCard', label: 'Cartão' },
  { name: 'WalletCards', label: 'Carteira' },
  { name: 'Banknote', label: 'Dinheiro' },
  { name: 'Plane', label: 'Viagem' },
  { name: 'Shield', label: 'Segurança / Reserva' },
  { name: 'PiggyBank', label: 'Cofrinho / Poupança' },
  { name: 'Sparkles', label: 'Sonho / Especial' },
  { name: 'Gift', label: 'Presente' },
  { name: 'Building', label: 'Imóvel' },
  { name: 'Smartphone', label: 'Celular' },
  { name: 'Tv', label: 'Streaming' },
  { name: 'Coffee', label: 'Café' },
  { name: 'Tag', label: 'Geral' },
];

export const AVAILABLE_COLORS = [
  { hex: '#F59E0B', bg: '#FEF3C7', label: 'Âmbar' },
  { hex: '#3B82F6', bg: '#DBEAFE', label: 'Azul' },
  { hex: '#10B981', bg: '#D1FAE5', label: 'Esmeralda' },
  { hex: '#EC4899', bg: '#FCE7F3', label: 'Rosa' },
  { hex: '#8B5CF6', bg: '#EDE9FE', label: 'Roxo' },
  { hex: '#06B6D4', bg: '#CFFAFE', label: 'Ciano' },
  { hex: '#D946EF', bg: '#FAE8FF', label: 'Fúcsia' },
  { hex: '#0D9488', bg: '#CCFBF1', label: 'Verde Petróleo' },
  { hex: '#EF4444', bg: '#FEE2E2', label: 'Vermelho' },
  { hex: '#6366F1', bg: '#EEF2FF', label: 'Índigo' },
  { hex: '#F97316', bg: '#FFEDD5', label: 'Laranja' },
  { hex: '#64748B', bg: '#F1F5F9', label: 'Ardósia' },
];

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'Utensils':
      return <Utensils {...props} />;
    case 'Home':
      return <Home {...props} />;
    case 'Car':
      return <Car {...props} />;
    case 'HeartPulse':
      return <HeartPulse {...props} />;
    case 'Palmtree':
      return <Palmtree {...props} />;
    case 'GraduationCap':
      return <GraduationCap {...props} />;
    case 'ShoppingBag':
      return <ShoppingBag {...props} />;
    case 'Briefcase':
      return <Briefcase {...props} />;
    case 'Laptop':
      return <Laptop {...props} />;
    case 'TrendingUp':
      return <TrendingUp {...props} />;
    case 'RotateCcw':
      return <RotateCcw {...props} />;
    case 'Coins':
      return <Coins {...props} />;
    case 'Zap':
      return <Zap {...props} />;
    case 'CreditCard':
      return <CreditCard {...props} />;
    case 'WalletCards':
      return <WalletCards {...props} />;
    case 'Banknote':
      return <Banknote {...props} />;
    case 'ArrowLeftRight':
      return <ArrowLeftRight {...props} />;
    case 'FileText':
      return <FileText {...props} />;
    case 'Tag':
      return <Tag {...props} />;
    case 'Plane':
      return <Plane {...props} />;
    case 'Shield':
      return <Shield {...props} />;
    case 'PiggyBank':
      return <PiggyBank {...props} />;
    case 'Sparkles':
      return <Sparkles {...props} />;
    case 'Gift':
      return <Gift {...props} />;
    case 'Building':
      return <Building {...props} />;
    case 'Smartphone':
      return <Smartphone {...props} />;
    case 'Tv':
      return <Tv {...props} />;
    case 'Coffee':
      return <Coffee {...props} />;
    default:
      return <CircleDollarSign {...props} />;
  }
};
