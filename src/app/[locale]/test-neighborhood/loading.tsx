export default function Loading() {
  return (
    <div className="container mx-auto p-8 flex justify-center items-center min-h-[50vh]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-600">Loading neighborhood analysis...</p>
      </div>
    </div>
  );
}
