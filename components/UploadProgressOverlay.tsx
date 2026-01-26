/** @format */

const IconMinimize = () => (
  <svg
    className='w-4 h-4 text-white'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='3'
      d='M19 9l-7 7-7-7'
    />
  </svg>
);

export type UploadTaskStatus = "pending" | "uploading" | "done" | "error";

export interface UploadTask {
  id: string;
  name: string;
  progress: number;
  status: UploadTaskStatus;
  error?: string;
}

export const UploadProgressOverlay = ({
  tasks,
  onClose,
  isMinimized = false,
  onToggleMinimize,
}: {
  tasks: UploadTask[];
  onClose?: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}) => {
  if (!tasks.length) return null;

  const active = tasks.some(
    (t) => t.status === "uploading" || t.status === "pending",
  );

  // Show as floating button when minimized
  if (isMinimized) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "done").length;
    const errorTasks = tasks.filter((t) => t.status === "error").length;

    return (
      <button
        onClick={onToggleMinimize}
        className='fixed bottom-32 right-6 w-14 h-14 rounded-full bg-[#FF7F50] shadow-xl flex items-center justify-center text-white active:scale-90 transition-all hover:shadow-2xl z-40'>
        <div className='flex flex-col items-center justify-center'>
          <span className='text-xs font-bold'>
            {completedTasks}/{totalTasks}
          </span>
          {errorTasks > 0 && (
            <span className='text-[10px] text-red-200'>!</span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className='fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end justify-center p-4'>
      <div className='w-full max-w-md bg-white rounded-3xl shadow-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-xs font-bold uppercase text-gray-400'>
              Đang tải ảnh
            </p>
            <h3 className='text-lg font-black text-[#2D3436]'>
              Tiến trình upload
            </h3>
          </div>
          <div className='flex items-center gap-2'>
            {onToggleMinimize && (
              <button
                onClick={onToggleMinimize}
                className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors'>
                <IconMinimize />
              </button>
            )}
            {onClose && !active && (
              <button
                onClick={onClose}
                className='text-sm font-bold text-[#FF7F50] uppercase tracking-wide'>
                Đóng
              </button>
            )}
          </div>
        </div>

        <div className='space-y-3 max-h-[320px] overflow-y-auto pr-1'>
          {tasks.map((task) => (
            <div
              key={task.id}
              className='border border-gray-100 rounded-2xl p-3 bg-gray-50/60'>
              <div className='flex items-center justify-between mb-2'>
                <p className='text-sm font-semibold text-[#2D3436] truncate'>
                  {task.name}
                </p>
                <span className='text-xs font-bold text-gray-400 uppercase'>
                  {task.status === "uploading" && "Đang tải"}
                  {task.status === "pending" && "Chờ"}
                  {task.status === "done" && "Hoàn tất"}
                  {task.status === "error" && "Lỗi"}
                </span>
              </div>
              <div className='w-full h-2 bg-white rounded-full overflow-hidden shadow-inner'>
                <div
                  className={`h-full rounded-full transition-all duration-200 ${
                    task.status === "error" ? "bg-red-400" : "bg-[#FF7F50]"
                  }`}
                  style={{ width: `${Math.min(task.progress, 100)}%` }}></div>
              </div>
              {task.error && (
                <p className='text-xs text-red-500 mt-2'>{task.error}</p>
              )}
            </div>
          ))}
        </div>

        {active && (
          <p className='text-[11px] text-gray-400 text-center'>
            Hệ thống đang tải lần lượt từng ảnh để đảm bảo ổn định.
          </p>
        )}
      </div>
    </div>
  );
};

export default UploadProgressOverlay;
