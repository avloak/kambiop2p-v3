import RatingClient from './RatingClient';

export function generateStaticParams() {
  return [];
}

export default function RatingPage({ params }: { params: { id: string } }) {
  return <RatingClient id={params.id} />;
}
