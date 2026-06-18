import FindingDetailClient from "./FindingDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FindingDetailPage({ params }: Props) {
  const { id } = await params;
  return <FindingDetailClient id={id} />;
}
