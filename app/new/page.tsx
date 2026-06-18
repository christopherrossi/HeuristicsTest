import FindingForm from "@/app/components/FindingForm";

export default function NewFindingPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Finding</h1>
        <p className="text-sm text-gray-500 mt-1">
          Document a usability issue against Nielsen&apos;s 10 heuristics.
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <FindingForm />
      </div>
    </div>
  );
}
