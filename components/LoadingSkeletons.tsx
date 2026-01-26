/** @format */


export const LoadingOverlay = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className='fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50'>
      <div className='bg-white rounded-full p-4 shadow-lg'>
        <div className='w-12 h-12 border-4 border-gray-200 border-t-[#FF7F50] rounded-full animate-spin'></div>
      </div>
    </div>
  );
};

export const SkeletonRoomCard = () => (
  <div className='p-5 bg-white rounded-3xl border border-gray-100 animate-pulse'>
    <div className='flex justify-between items-center'>
      <div className='flex-1'>
        <div className='h-5 bg-gray-200 rounded-lg w-32 mb-2'></div>
        <div className='h-3 bg-gray-200 rounded-lg w-48'></div>
      </div>
      <div className='w-10 h-10 bg-gray-200 rounded-2xl'></div>
    </div>
  </div>
);

export const SkeletonPhotoGrid = ({
  cols = 3,
  count = 9,
}: {
  cols?: number;
  count?: number;
}) => (
  <div
    className='grid gap-1'
    style={{
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    }}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className='aspect-square bg-gray-200 rounded-lg animate-pulse'></div>
    ))}
  </div>
);

export const SkeletonText = ({
  width = "w-24",
  height = "h-4",
}: {
  width?: string;
  height?: string;
}) => (
  <div
    className={`${width} ${height} bg-gray-200 rounded-lg animate-pulse`}></div>
);

export const SkeletonHeader = () => (
  <div className='mb-8 animate-pulse'>
    <div className='h-8 bg-gray-200 rounded-lg w-48 mb-2'></div>
    <div className='h-4 bg-gray-200 rounded-lg w-64'></div>
  </div>
);

export const SkeletonInputBox = () => (
  <div className='mb-8 p-6 rounded-[2rem] bg-gray-50 border border-gray-100 animate-pulse'>
    <div className='h-12 bg-gray-200 rounded-lg mb-4'></div>
    <div className='h-12 bg-gray-200 rounded-lg'></div>
  </div>
);
