import TradeClient from './TradeClient';

export function generateStaticParams() {
  return [];
}

export default function TradePage({ params }: { params: { id: string } }) {
  return <TradeClient id={params.id} />;
}
