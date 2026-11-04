import { useTranslatedText } from '@/hooks/useTranslatedText';

export default function TranslatedText({ children, as: Component = 'span', ...props }) {
  const translated = useTranslatedText(typeof children === 'string' ? children : '');
  return <Component {...props}>{translated}</Component>;
}