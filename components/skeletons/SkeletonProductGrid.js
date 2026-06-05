import SkeletonProductCard from './SkeletonProductCard';

export default function SkeletonProductGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
      {[...Array(count)].map((_, index) => (
        <SkeletonProductCard key={index} />
      ))}
    </div>
  );
}
